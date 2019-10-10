exports.getPage = (req, res) => {
    let data = [
        ['1','a'],
        ['1','a'],
        ['1','a'],
        ['1','a'],
        ['2','a'],
        ['2','a'],
        ['2','a'],
        ['2','b'],
        ['2','b'],
        ['3','b'],
        ['2','3'],
        ['1','3']
    ]
    res.render('analitic.html', {data})
}