<?php
// Copiar como config.php (no se sube a git) y completar con los datos de la DB de Ferozo.
return [
    'db_host' => 'localhost',
    'db_name' => 'nombre_de_la_base',
    'db_user' => 'usuario',
    'db_pass' => 'contraseña',
    // Token para poder lanzar la sincronización por URL:
    // https://nuriaiturrioz.com/api-web/sync-tournaments.php?token=...
    'sync_token' => 'cambiar-por-un-texto-largo-y-aleatorio',
    // ID de Nuria en el LET (ladieseuropeantour.com/player/200899)
    'player_id' => '200899',
];
