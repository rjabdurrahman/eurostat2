const dashStyles = [
    ['solid', 'none'],
    ['longdash', '16,6'],
    ['dot', '2,6'],
    ['longdashdotdot', '16,6,2,6,2,6'],
    ['shortdash', '6,2'],
    ['longdashdot', '16,6,2,6'],
    ['shortdashdot', '2,2'],
    ['dash', '8,6'],
    ['shortdashdotdot', '6,2,2,2,2,2'],
    ['dashdot', '8,6,2,6'],
    ['shortdot', '2,2'],
    ['solid', 'none'],
    ['longdash', '16,6'],
    ['dot', '2,6'],
    ['longdashdotdot', '16,6,2,6,2,6'],
    ['shortdash', '6,2'],
    ['longdashdot', '16,6,2,6'],
    ['shortdashdot', '2,2'],
    ['dash', '8,6'],
    ['shortdashdotdot', '6,2,2,2,2,2'],
    ['dashdot', '8,6,2,6'],
    ['shortdot', '2,2']
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
let query = {
    dataset: "prc_hicp_midx",
    filter: {
        geo: ["AT", "BG", "NL", "NO"],
        unit: ["I15"],
        coicop: [
            "CP01131",
            "CP01132"
        ]
    }
};

function dateMonthStrParser(str) {
    let [year, month] = str.split('M');
    return [Number(year), month - 1, 1];
}

var countryLegends = [
    {id: 'EU', color: '#7cb5ec', label: 'European Union'}
];
var itemLegends = [
    {id: 'CP0111', label: 'Bread and cereals', dashType: 'solid', dashSvg: 'none'}
];

function renderCountryLengends() {
    $('#legend1').html(
        countryLegends.map(x => `<li name="${x.id}">
        <span style="background-color: ${x.color}"></span>
        <strong>${x.label}</strong>
      </li>`).join('')
    );
}

function renderItemLegends() {
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
                dashStyle: dashStyles[y][0],
                color: colors[x],
            })
        }
    }
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
        createSlider();
        updateSliderRange(chart, JSON.parse(JSON.stringify(seriesList)), null);
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