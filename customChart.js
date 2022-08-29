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

var countryLegends = [];
var itemLegends = [];

function renderCountryLengends(ds) {
    let label;
    for (let x = 0; x < ds.Dimension('geo').id.length; x++) {
        label = ds.Dimension('geo').Category(x).label.includes('European Union') ? 'European Union' : ds.Dimension('geo').Category(x).label;
        if (ds.Dimension('geo').Category(x) && !_.find(countryLegends, { label })) countryLegends.push({
            id: ds.Dimension('geo').id[x],
            color: _.find(countryLegends, { id: ds.Dimension('geo').id[x] })?.color || colors[countryLegends.length + x],
            label,
        })
    }
    $('#legend1').html(
        countryLegends.map(x => `<li name="${x.id}">
        <span style="background-color: ${x.color}"></span>
        <strong>${x.label}</strong>
      </li>`).join('')
    );
}

function renderItemLegends(ds) {
    for (let y = 0; y < ds.Dimension('coicop').id.length; y++) {
        let label = ds.Dimension('coicop').Category(y).label;
        if (ds.Dimension('coicop').Category(y) && !_.find(itemLegends, { label })) itemLegends.push({
            id: ds.Dimension('coicop').id[y],
            label,
            dashType: _.find(itemLegends, { id: ds.Dimension('coicop').id[y] })?.dashType || dashTypes[itemLegends.length + y],
            dashSvg: _.find(itemLegends, { id: ds.Dimension('coicop').id[y] })?.dashSvg || dashSvg[itemLegends.length + y]
        })
    }
    $('#legend2').html(
        itemLegends.map(x => `<li name="${x.id}">
            <span>
            <svg height="10" width="60">
                <path fill="none" d="M 5 5 L 60 5" stroke="#8085e9" stroke-width="2" stroke-dasharray="${x.dashSvg}"></path>
            </svg>
            </span>
            <strong>${x.label}</strong>
        </li>`).join('')
    );
}

var seriesList = [];
var hChart;
var existingSliderValues;
function createChart(ds) {
    const start = ds.Dimension("time").Category(0).index;
    const geo = ds.Dimension("geo");
    let myDateFormat = '%b \ %Y';
    seriesList = [];
    renderCountryLengends(ds);
    renderItemLegends(ds);
    for (let x = 0; x < query.filter.geo.length; x++) {
        for (let y = 0; y < query.filter.coicop.length; y++) {
            if (geo.Category(x)) seriesList.push({
                id: `[${query.filter.geo[x]}]**[${query.filter.coicop[y]}]`,
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
    existingSliderValues = _.get(slider, 'noUiSlider') && slider.noUiSlider.get().map(x => Number(x));
    // createSlider(JSON.parse(JSON.stringify(seriesList)))
    // _.get(slider, 'noUiSlider') && slider.noUiSlider.set(existingSliderValues)
    // if (hChart) {
    //     for (let i = hChart.series.length - 1; i >= 0; i--) {
    //         hChart.series[i].remove(false);
    //     }
    //     seriesList.forEach(s => hChart.addSeries(s));
    //     addChartLengendHoverEffect(hChart);
    //     updateRange(hChart, JSON.parse(JSON.stringify(seriesList)), existingSliderValues);
    // }
    // else 
    hChart = Highcharts.chart("chart", {
        title: { text: "Highcharts Demo" },
        subtitle: { text: "Source: " + ds.source },
        chart: {
            zoomType: 'x'
        },
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
            tickInterval: 30 * 24 * 3600 * 1000,
            dateTimeLabelFormats: {
                millisecond: myDateFormat,
                second: myDateFormat,
                minute: myDateFormat,
                hour: myDateFormat,
                day: myDateFormat,
                week: myDateFormat,
                month: myDateFormat,
                year: myDateFormat
            },
            crosshair: {
                snap: true
            }
        },
        yAxis: {
            title: { text: "Index, 2015=100" }
        },
        tooltip: {
            xDateFormat: '%b \ %Y',
            shared: true,
            split: false,
            enabled: true,
            useHTML: true,
            padding: 0,
            formatter: function () {
                let seriesRow = this.points.map(p => `<tr>
                    <td><span style="background: ${p.series.color}"></span> ${p.series.name}</td>
                    <td>${p.y.toFixed(2)}</td>
                    </tr>`).join('')
                return `<table class="tooltip-table">
                        <tr>
                        <th colspan="2">${Highcharts.dateFormat('%b %Y', new Date(this.x))}</th>
                        </tr>
                        ${seriesRow}
                    </table>`
            }
        },
        plotOptions: {},
        series: seriesList
    }, function (chart) {
        addChartLengendHoverEffect(chart);
        // updateRange(chart, JSON.parse(JSON.stringify(seriesList)), existingSliderValues);
    });
};

function addChartLengendHoverEffect(chart) {
    $('#legend1 li').add('#legend2 li').on('mouseenter', (e) => {
        chart.series.forEach(s => {
            let targetItem = e.target.textContent.trim();
            if (s.name.includes(targetItem)) {
                s.update({
                    opacity: 1
                }, false)
            } else {
                s.update({
                    opacity: 0.15
                }, false)
            }
        })
        chart.redraw();
    })

    $('#legend1 li').add('#legend2 li').on('mouseleave', (e) => {
        chart.series.forEach(s => {
            s.update({
                opacity: 1
            }, false)
        })
        chart.redraw();
    })
}