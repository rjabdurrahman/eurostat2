let itemSelector = $('#itemSelect').comboTree({
    source: [
        {
            id: '1',
            title: 'Bread and cereals',
            subs: [
                {
                    id: 'CP0111',
                    title: 'CP0111 Bread and cereals'
                },
                {
                    id: 'CP01111',
                    title: 'CP01111 Rice'
                },
                {
                    id: 'CP01113',
                    title: 'CP01113 Bread'
                },
                {
                    id: 'CP01114',
                    title: 'CP01114 Other bakery products'
                },
                {
                    id: 'CP01115',
                    title: 'CP01115 Pizza and quiche'
                },
                {
                    id: 'CP01116',
                    title: 'CP01116 Pasta products and couscous'
                },
                {
                    id: 'CP01117',
                    title: 'CP01117 Breakfast cereals'
                },
                {
                    id: 'CP01118',
                    title: 'CP01118 Other cereal products'
                }
            ]
        },
        {
            id: '2',
            title: 'Meat',
            subs: [
                {
                    id: 'CP0112',
                    title: 'CP0112 Meat'
                },
                {
                    id: 'CP01121',
                    title: 'CP01121 Beef and veal'
                },
                {
                    id: 'CP01122',
                    title: 'CP01122 Pork'
                },
                {
                    id: 'CP01123',
                    title: 'CP01123 Lamb and goat'
                },
                {
                    id: 'CP01124',
                    title: 'CP01124 Poultry'
                },
                {
                    id: 'CP01125',
                    title: 'CP01125 Other meats'
                },
                {
                    id: 'CP01126',
                    title: 'CP01126 Edible offal'
                },
                {
                    id: 'CP01127',
                    title: 'CP01127 Dried, salted or smoked meat'
                },
                {
                    id: 'CP01128',
                    title: 'CP01128 Other meat preparations'
                }
            ]
        },
    ],
    isMultiple: true,
    cascadeSelect: false,
    collapse: true,
    selectableLastNode: true
});
let countrySelector = $('#countries').comboTree({
    source: [
        { id: "EU", title: "European Union" },
        { id: "AT", title: "Austria" },
        { id: "BE", title: "Belgium" },
        { id: "BG", title: "Bulgaria" },
        { id: "HR", title: "Croatia" },
        { id: "CY", title: "Cyprus" },
        { id: "CZ", title: "Czechia" },
        { id: "DK", title: "Denmark" },
        { id: "EE", title: "Estonia" },
        { id: "FI", title: "Finland" },
        { id: "FR", title: "France" },
        { id: "DE", title: "Germany" },
        { id: "EL", title: "Greece" },
        { id: "HU", title: "Hungary" },
        { id: "IE", title: "Ireland" },
        { id: "IT", title: "Italy" },
        { id: "LV", title: "Latvia" },
        { id: "LU", title: "Luxembourg" },
        { id: "MT", title: "Malta" },
        { id: "NL", title: "Netherlands" },
        { id: "NO", title: "Norway" }
    ],
    isMultiple: true,
    cascadeSelect: false,
    collapse: true,
    selectableLastNode: true
})
itemSelector.setSelection(['CP0111'])
countrySelector.setSelection(['EU'])
$('input.multiplesFilter').get(0).style.display = 'none';
// EuroJSONstat.fetchDataset(query)
//   .then(ds => {
//     console.log(ds)
//     console.log(ds.Data({ geo: ds.Dimension("geo").id[0], coicop: 'CP01131' }, false))
//   })
$(document).ready(function () {
    query.filter.geo = countrySelector.getSelectedIds() || [];
    query.filter.coicop = itemSelector.getSelectedIds() || [];
    if (query.filter.geo.length && query.filter.coicop.length) EuroJSONstat.fetchDataset(query).then(createChart);
});
$('#itemSelect').add('#countries').change((e) => {
    let selectedCountry = _.difference(countrySelector.getSelectedIds(), query.filter.geo);
    let deselectedCountry = _.difference(query.filter.geo, countrySelector.getSelectedIds());
    let selectedItems = _.difference(itemSelector.getSelectedIds(), query.filter.coicop);
    let deselectedItems = _.difference(query.filter.coicop, itemSelector.getSelectedIds());
    if (deselectedCountry.length || deselectedItems.length) {
        hChart.series
            .filter(x => x.options.id.includes(deselectedCountry[0] || deselectedItems[0]))
            .forEach(s => s.remove())
    }
    if (selectedCountry.length) {
        EuroJSONstat.fetchDataset({
            dataset: "prc_hicp_midx",
            filter: {
                geo: selectedCountry,
                unit: ["I15"],
                coicop: query.filter.coicop
            }
        }).then((ds) => {
            appendSeries(ds, selectedCountry, query.filter.coicop, 'country')
        })
    }
    if (selectedItems.length) {
        EuroJSONstat.fetchDataset({
            dataset: "prc_hicp_midx",
            filter: {
                geo: query.filter.geo,
                unit: ["I15"],
                coicop: selectedItems
            }
        }).then((ds) => {
            appendSeries(ds, query.filter.geo, selectedItems, 'item')
        })
    }
    query.filter.geo = countrySelector.getSelectedIds() || [];
    query.filter.coicop = itemSelector.getSelectedIds() || [];
    // if (query.filter.geo.length && query.filter.coicop.length) EuroJSONstat.fetchDataset(query).then(createChart);
})


function appendSeries(ds, countries, items, trigger) {
    let geo = ds.Dimension('geo');
    let coicop = ds.Dimension('coicop');
    for (let x = 0; x < countries.length; x++) {
        for (let y = 0; y < items.length; y++) {
            if (geo.Category(x)) hChart.addSeries({
                id: `${countries[x]}**${items[y]}`,
                name: `${geo.Category(x).label.includes('European Union') ? 'European Union' : geo.Category(x).label} (${coicop.Category(y).label})`,
                data: ds.Data({ geo: countries[x], coicop: items[y] }, false).map(
                    (val, ix) => [
                        new Date(...dateMonthStrParser(ds.Dimension("time").id[ix])).getTime(),
                        val
                    ]
                ).filter(x => Boolean(x[1])),
                dashStyle: trigger === 'item' ? dashTypes[itemLegends.length + y] : _.find(itemLegends, { id: ds.Dimension('coicop').id[y] }).dashType,
                color: trigger === 'country' ? colors[countryLegends.length + x] : _.find(countryLegends, { id: ds.Dimension('geo').id[x] }).color,
            })
        }
    }
    trigger === 'country' && renderCountryLengends(ds);
    trigger === 'item' && renderItemLegends(ds);
    addChartLengendHoverEffect(hChart);
}