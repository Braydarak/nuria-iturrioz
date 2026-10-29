<?php
// Sincroniza el calendario del LET y comprueba en el listado de "Entries" de
// cada torneo próximo si Nuria está inscrita.
//
// Cron (Ferozo):  php /ruta/a/public_html/api-web/sync-tournaments.php
// Por URL:        https://nuriaiturrioz.com/api-web/sync-tournaments.php?token=...
require __DIR__ . '/lib.php';

const LET_API = 'https://api.euro.ocs-software.com/let/cache/let';

$isCli = PHP_SAPI === 'cli';
$config = load_config();

if (!$isCli) {
    header('Content-Type: text/plain; charset=utf-8');
    $token = (string) ($_GET['token'] ?? '');
    if ($config['sync_token'] === '' || !hash_equals($config['sync_token'], $token)) {
        http_response_code(403);
        exit("Forbidden\n");
    }
}

function out(string $line): void
{
    echo '[' . date('Y-m-d H:i:s') . "] $line\n";
}

function fetch_json(string $url): ?array
{
    $sep = strpos($url, '?') === false ? '?' : '&';
    $ch = curl_init($url . $sep . 'randomadd=' . time());
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'nuriaiturrioz.com tournament sync',
    ]);
    $body = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($body === false || $status !== 200) {
        return null;
    }
    $data = json_decode($body, true);
    return is_array($data) ? $data : null;
}

/** La API devuelve un objeto suelto en vez de lista cuando hay un solo elemento. */
function as_list($value): array
{
    if (!is_array($value) || !$value) return [];
    return array_keys($value) === range(0, count($value) - 1) ? $value : [$value];
}

/**
 * Busca a la jugadora en el listado de inscritas.
 * Devuelve null si no se pudo leer el listado, o ['entered' => bool, 'status' => ?string].
 */
function find_player_entry(int $season, string $code, string $playerId): ?array
{
    $data = fetch_json(LET_API . "/$season/$season-$code-entry-entries.json");
    if ($data === null) return null;

    foreach (as_list($data['entries']['entries_entry'] ?? []) as $entry) {
        if (($entry['playerno'] ?? '') === $playerId) {
            return [
                // "A" = Entered; "F" = Reserve #N
                'entered' => ($entry['status_code'] ?? '') === 'A',
                'status' => trim((string) ($entry['status_text'] ?? '')) ?: null,
            ];
        }
    }
    return ['entered' => false, 'status' => null];
}

$pdo = db($config);
$today = date('Y-m-d');
$year = (int) date('Y');
// A partir de septiembre también miramos la temporada siguiente
$seasons = (int) date('n') >= 9 ? [$year, $year + 1] : [$year];

$upsert = $pdo->prepare(
    'INSERT INTO tournaments
       (season, code, name, start_date, end_date, location, city, country, cancelled)
     VALUES (:season, :code, :name, :start_date, :end_date, :location, :city, :country, :cancelled)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name), start_date = VALUES(start_date), end_date = VALUES(end_date),
       location = VALUES(location), city = VALUES(city), country = VALUES(country),
       cancelled = VALUES(cancelled)'
);
$saveEntry = $pdo->prepare(
    'UPDATE tournaments
     SET nuria_entered = :entered, nuria_status = :status, entries_checked_at = NOW()
     WHERE season = :season AND code = :code'
);

$errors = 0;
foreach ($seasons as $season) {
    $schedule = fetch_json(LET_API . "/$season/tmticx");
    $list = as_list($schedule['tournaments']['tournaments_entry'] ?? []);
    if (!$list) {
        out("Temporada $season: sin calendario publicado");
        continue;
    }
    out("Temporada $season: " . count($list) . ' torneos');

    foreach ($list as $t) {
        $code = (string) ($t['code'] ?? '');
        $start = let_date_to_sql((string) ($t['start_date'] ?? ''));
        $end = let_date_to_sql((string) ($t['end_date'] ?? '')) ?? $start;
        if ($code === '' || $start === null) continue;

        $upsert->execute([
            'season' => $season,
            'code' => $code,
            'name' => trim((string) $t['full_name']),
            'start_date' => $start,
            'end_date' => $end,
            'location' => trim((string) ($t['course'] ?? '')) ?: null,
            'city' => trim((string) ($t['course_city'] ?? '')) ?: null,
            'country' => trim((string) ($t['course_country'] ?? '')) ?: null,
            'cancelled' => ($t['cancelled'] ?? 'N') === 'Y' ? 1 : 0,
        ]);

        // Los torneos ya terminados conservan el último estado conocido
        if ($end < $today) continue;

        $entry = find_player_entry($season, $code, (string) $config['player_id']);
        if ($entry === null) {
            $errors++;
            out("  $code {$t['full_name']}: no se pudo leer Entries");
            continue;
        }
        $saveEntry->execute([
            'entered' => $entry['entered'] ? 1 : 0,
            'status' => $entry['status'],
            'season' => $season,
            'code' => $code,
        ]);
        out(sprintf('  %s %s (%s): %s', $code, $t['full_name'], $start, $entry['status'] ?? 'no inscrita'));
    }
}

out($errors ? "Terminado con $errors errores" : 'Terminado');
exit($errors ? 1 : 0);
