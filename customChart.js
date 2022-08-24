const dashTypes = [
    'solid',
    'longdash',
    'dot',
    'longdashdotdot',
    'shortdash',
    'longdashdot',
    'shortdashdot',
    'dash',
    'shortdashdotdot',
    'dashdot',
    'shortdot',
    'solid',
    'longdash',
    'dot',
    'longdashdotdot',
    'shortdash',
    'longdashdot',
    'shortdashdot',
    'dash',
    'shortdashdotdot',
    'dashdot',
    'shortdot',
];
const colors = [
    "#7cb5ec",
    "#434348",
    "#90ed7d",
    "#f7a35c",
    "#8085e9",
    "#f15c80",
    "#e4d354",
    "#2b908f",
    "#f45b5b",
    "#91e8e1",
    "#7cb5ec",
    "#434348",
    "#90ed7d",
    "#f7a35c",
    "#8085e9",
    "#f15c80",
    "#e4d354",
    "#2b908f",
    "#f45b5b",
    "#91e8e1",
    "#7cb5ec",
];
const dashSvg = [
    'none',
    '16,6',
    '2,6',
    '16,6,2,6,2,6',
    '6,2',
    '16,6,2,6',
    '2,2',
    '8,6',
    '6,2,2,2,2,2',
    '8,6,2,6',
    '2,2',
    'none',
    '16,6',
    '2,6',
    '16,6,2,6,2,6',
    '6,2',
    '16,6,2,6',
    '2,2',
    '8,6',
    '6,2,2,2,2,2',
    '8,6,2,6',
    '2,2'
]
let query = {
    dataset: "prc_hicp_midx",
    filter: {
        geo: ["AT", "BG", "NL", "NO"],
        unit: ["I15"],
        coicop: [
            "CP01131",
            "CP01132"
        ],
        //lastTimePeriod: 5
    }
};

function dateMonthStrParser(str) {
    let [year, month] = str.split('M');
    return [Number(year), month - 1, 1];
}

function renderLegend2(ds) {
    $('#legend2').html('');
    for (let y = 0; y < query.filter.coicop.length; y++) {
        $('#legend2').append(`
        <li>
          <span>
            <svg height="10" width="60">
              <path fill="none" d="M 5 5 L 60 5" stroke="#8085e9" stroke-width="2" stroke-dasharray="${dashSvg[y]}"></path>
            </svg>
          </span>
          <strong>${ds.Dimension('coicop').Category(y).label}</strong>
        </li>`);
    }
}

var seriesList = [];
function createChart(ds) {
    const start = ds.Dimension("time").Category(0).index;
    const geo = ds.Dimension("geo");
    let myDateFormat = '%b \ %Y';
    seriesList = [];

    $('#legend1').html('');
    for (let x = 0; x < query.filter.geo.length; x++) {
        $('#legend1').append(`
        <li>
          <span style="background-color: ${colors[x]}"></span>
          <strong>${geo.Category(x).label.includes('European Union') ? 'European Union' : geo.Category(x).label}</strong>
        </li>`);
    }
    renderLegend2(ds);

    for (let x = 0; x < query.filter.geo.length; x++) {
        for (let y = 0; y < query.filter.coicop.length; y++) {
            // console.log(geo.Category(x).label.includes('European Union'), query.filter.geo[x], query.filter.coicop[y], dashTypes[y])
            seriesList.push({
                name: `${geo.Category(x).label.includes('European Union') ? 'European Union' : geo.Category(x).label} (${ds.Dimension('coicop').Category(y).label})`,
                data: ds.Data({ geo: query.filter.geo[x], coicop: query.filter.coicop[y] }, false).map(
                    (val, ix) => [
                        new Date(...dateMonthStrParser(ds.Dimension("time").id[ix])).getTime(),
                        val
                    ]
                ).filter(x => Boolean(x[1])),
                dashStyle: dashTypes[y],
                color: colors[x],
            })
        }
    }

    let chart = Highcharts.chart("chart", {
        title: { text: "Highcharts Demo" },
        subtitle: { text: "Source: " + ds.source },
        legend: {
            enabled: false,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            y: 50,
            symbolWidth: 50
        },
        xAxis: {
            type: 'datetime',
            tickInterval: 10*24*60*60,
            dateTimeLabelFormats: {
                millisecond: myDateFormat,
                second: myDateFormat,
                minute: myDateFormat,
                hour: myDateFormat,
                day: myDateFormat,
                week: myDateFormat,
                month: myDateFormat,
                year: myDateFormat
            }
        },
        yAxis: {
            title: { text: "Index, 2015=100" }
        },
        tooltip: {
            formatter: function (event) {
                console.log(event)
                console.log(event.chart)
                return `<span>${Highcharts.dateFormat('%b %Y', new Date(this.x))}</span><br><i>${this.series.name}</i><br><strong>${this.y}</strong>`;
            }
        },
        plotOptions: {
            series: {
                label: { connectorAllowed: false },
                point: {
                    events: {
                        // mouseOver: function (e) {
                        //     console.log(this.category)
                        //     for (let sd of this.series.chart.series.map(x => x.data)) {
                        //         // console.log(sd.find(x => x.category === this.category).y)
                        //         console.log(sd.find(x => x.category === this.category))
                        //     }
                        // }
                    }
                }
            }
        },
        series: seriesList
    }, function (chart) {
        updateRange(chart, JSON.parse(JSON.stringify(seriesList)));
        addChartLengendHoverEffect(chart);
    });
};