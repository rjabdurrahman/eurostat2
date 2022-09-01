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
function updateSliderRange(chart, existingValues) {
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
    })
    
    slider.noUiSlider.on('change', function (values, handle) {
        chart.xAxis[0].setExtremes(...values.map(x => Number(x)));
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

function startLoading() {
    $('#loading').animate({
        width: $('#chart').width() + 'px'
    }, 600)
}

function endLoading() {
    $('#loading').animate({
        width: '0px'
    }, 0)
}