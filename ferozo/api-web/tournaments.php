<?php
// GET /api-web/tournaments.php → { "tournaments": [...] } con el mismo formato que
// usaba public/tournaments.json.
require __DIR__ . '/lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=300');

try {
    $pdo = db(load_config());
    $stmt = $pdo->prepare(
        'SELECT * FROM tournaments
         WHERE cancelled = 0 AND season >= ?
         ORDER BY start_date, id'
    );
    $stmt->execute([(int) date('Y') - 1]);
    $rows = $stmt->fetchAll();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['tournaments' => [], 'error' => 'db_error']);
    exit;
}

$tournaments = array_map(function (array $row) {
    $confirmed = $row['confirmed_override'] !== null
        ? (bool) $row['confirmed_override']
        : (bool) $row['nuria_entered'];
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'date' => sql_date_to_let($row['start_date']),
        'date_end' => sql_date_to_let($row['end_date']),
        'location' => $row['location'],
        'country' => $row['country'],
        'type' => 'Ladies',
        'confirmed' => $confirmed,
        'status' => $row['nuria_status'],
        'code' => $row['code'],
        'scores_param' => $row['scores_param'],
    ];
}, $rows);

echo json_encode(['tournaments' => $tournaments], JSON_UNESCAPED_UNICODE);
