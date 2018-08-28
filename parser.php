<?php
$csv_file = fopen(__DIR__ . '/surveyresults.csv', 'r');
$total_responses = 0;
$responses = [];

while (($row = fgetcsv($csv_file, 10000)) !== false) {
    // Question row
    if ($total_responses == 0) {
        foreach ($row as $index => $value) {
            $responses[$index]['question'] = $value;
        }
        $total_responses++;
        continue;
    }

    foreach ($row as $index => $value) {
        if ($value == '(blank)' || $value == '') {
            continue;
        }
        $responses[$index]['answers'][] = $value;
    }
    $total_responses++;
}
fclose($csv_file);

$json_file = fopen(__DIR__ . '/results.json', 'w');
fwrite($json_file, json_encode([
    'totalResponses' => $total_responses,
    'responses' => $responses,
]));
fclose($json_file);
