var slider;
let monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function createSlider() {
    let dateNumbers = seriesList[0].data.map(x => x[0])
    if (slider && slider.noUiSlider) {
        slider.noUiSlider.destroy();
    }
    slider = document.getElementById('slider');
    noUiSlider.create(slider, {
        start: [Math.min(...dateNumbers), Math.max(...dateNumbers)],
        connect: true,
        tooltips: true,
        step: 2592000,
        range: {
            'min': Math.min(...dateNumbers),
            'max': Math.max(...dateNumbers)
        }
    }, true);
}
function updateSliderRange(chart, seriesData, existingValues) {
    slider.noUiSlider.on('update', function (values, handle) {
        $('.noUi-tooltip').eq(0).text(
            monthNames[new Date(Number(values[0])).getMonth()]
            + ' '
            + new Date(Number(values[0])).getFullYear()
        )
        $('.noUi-tooltip').eq(1).text(
            monthNames[new Date(Number(values[1])).getMonth()]
            + ' '
            + new Date(Number(values[1])).getFullYear()
        )
        if (existingValues && existingValues.length) {
            let newSeries = JSON.parse(JSON.stringify(seriesData))
            for (let idx in newSeries) {
                chart.series[idx].update({
                    data: newSeries[idx].data.filter(x => x[0] >= existingValues[0] && x[0] <= existingValues[1])
                }, false)
            }
            chart.redraw();
        }
    })

    slider.noUiSlider.on('change', function (values, handle) {
        let newSeries = JSON.parse(JSON.stringify(seriesData))
        for (let idx in newSeries) {
            chart.series[idx].update({
                data: newSeries[idx].data.filter(x => x[0] >= Number(values[0]) && x[0] <= Number(values[1]))
            }, false)
        }
        chart.redraw(false);
    });
}
$('#slider').width(
    $('#chart').width() - 65
)
addEventListener('resize', (event) => {
    $('#slider').width(
        $('#chart').width() - 65
    )
});