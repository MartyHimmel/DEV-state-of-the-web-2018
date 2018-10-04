fetch('results.json')
.then(res => {
    return res.json();
})
.then(results => {
    google.charts.load('current', {packages: ['bar']});
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
        drawChart(question, answers, div);
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
    if (question.indexOf("How long have you") > -1) {
        // special case the question that should have been a range in the first place
        rows = aggregateToRanges(rows);
    } else {
        processData(rows);
    }
    data.addRows(rows);
    let options = {
        chart: {
            title: question
        },
        bars: 'horizontal',
        height: 400,
        width: 800,
        bar: {
            groupWidth: 50
        },
        legend: {
            position: 'none'
        },
        vAxis: {
            title: ''
        }
        // colors: colors
    }
    const chart = new google.charts.Bar(div);
    chart.draw(data, google.charts.Bar.convertOptions(options));
}

function processData(rows) {
    if (isYesNoQuestion(rows)) {
        rows[0][0] = 'No';
        rows[1][0] = 'Yes';
    } else if (isRatingQuestion(rows)) {
        return;
    } else if (isRangeQuestion(rows)) {
        return;
    }
    rows.sort((a, b) => b[1] - a[1]);
}

function isYesNoQuestion(rows) {
    return isOrderedQuestion(rows, 2);
}

function isRatingQuestion(rows) {
    return isOrderedQuestion(rows, 11);
}

function isOrderedQuestion(rows, count) {
    if (rows.length !== count) {
        return false;
    }
    for (let i=0; i<count; i++) {
        if (rows[i][0] !== i.toString()) {
            return false;
        }
    }
    return true;
}

function isRangeQuestion(rows) {
    if (rows[0][0] === '18 - 24') {
        return true;
    }
    const values = rows.map(r => parseInt(r[0]));
    const numbers = values.filter(v => !isNaN(v));
    if (numbers.length === rows.length) {
        return true;
    }
    return false;
}

function createRangeLabel(start, finish) {
    if (finish === Number.MAX_SAFE_INTEGER) {
        return `Immortal time-traveller`;
    }
    return `${start}-${finish} years`;
}

function aggregateToRanges(rows) {
    const ranges = [0, 1, 2, 5, 10, 20, 30, 40, 50, Number.MAX_SAFE_INTEGER];
    const aggregateRows = [];
    const addAggregateRow = (range) => {
        aggregateRows.push([createRangeLabel(range.start, range.end), range.sum])
    }
    let currentRangeIndex = 0;
    let currentRange;
    rows.forEach((r, i) => {
        const value = parseInt(r[0]);
        const count = r[1];
        for (; value >= ranges[currentRangeIndex+1] ;) {
            currentRangeIndex++;
            if (currentRangeIndex >= ranges.length) {
                throw new Error(`Whatever you said plus one!`);
            }
        }
        let currentStart = ranges[currentRangeIndex];
        let currentEnd = ranges[currentRangeIndex+1];
        if (currentRange && currentRange.start < currentStart) {
            addAggregateRow(currentRange);
            currentRange = null;
        }
        if (!currentRange) {
            currentRange = {
                start: currentStart,
                end: currentEnd,
                sum: 0
            };
        }
        currentRange.sum += count;
    });
    if (currentRange) {
        addAggregateRow(currentRange);
    }
    return aggregateRows;
}