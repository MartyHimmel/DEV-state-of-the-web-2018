fetch('results.json')
.then(res => {
    return res.json();
})
.then(results => {
    google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(() => {
        createCharts(results);
    });
});

function createCharts(results) {
    const total = results.totalResponses;
    results.responses.forEach((response, index) => {
        let question = response.question;
        let answers = parseAnswers(response.answers);
        let div = createChartContainer(index);
        document.querySelector('.charts-container').appendChild(div);
        drawChart(response.question, answers, div);
    });
    document.querySelector('.notification').remove();
}

function parseAnswers(responses) {
    let uniqueAnswers = Array.from(new Set(responses));
    uniqueAnswers.sort((a, b) => a - b || a > b);
    return uniqueAnswers.map(uniqueAnswer => {
        return {
            answer: uniqueAnswer,
            count: responses.filter(answer => answer === uniqueAnswer).length,
        };
    });
}

function createChartContainer(index) {
    let div = document.createElement('div');
    div.id = `chart-${index}`;
    div.classList.add('chart');
    return div;
}

function drawChart(question, answers, div) {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Response');
    data.addColumn('number', 'Count');
    let rows = answers.map(answer => {
        return [
            answer.answer,
            answer.count
        ];
    });
    data.addRows(rows);
    let chartOptions = {
        title: question,
        height: 500,
    };
    let chart = new google.visualization.PieChart(div);
    chart.draw(data, chartOptions);
}
