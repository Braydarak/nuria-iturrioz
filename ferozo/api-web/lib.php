<?php

function load_config(): array
{
    $path = __DIR__ . '/config.php';
    if (!is_file($path)) {
        throw new RuntimeException('Falta api-web/config.php (copiar config.example.php)');
    }
    return require $path;
}

function db(array $config): PDO
{
    $dsn = $config['db_dsn'] ?? sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        $config['db_host'],
        $config['db_name']
    );
    return new PDO($dsn, $config['db_user'] ?? null, $config['db_pass'] ?? null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

/** Convierte "DD/MM/YY" (formato del LET) a "YYYY-MM-DD". */
function let_date_to_sql(string $date): ?string
{
    $d = DateTime::createFromFormat('!d/m/y', trim($date));
    return $d ? $d->format('Y-m-d') : null;
}

/** Convierte "YYYY-MM-DD" a "DD/MM/YY" (formato que usa el frontend). */
function sql_date_to_let(string $date): string
{
    return DateTime::createFromFormat('!Y-m-d', $date)->format('d/m/y');
}
