let baseUrl =
  'https://www.dlsite.com/maniax/mypage/userbuy/=/type/all/start/all/sort/1/order/1/page/'
let lastPage = 1
let result = new Object()
result.count = 0
result.totalPrice = 0
result.works = new Array()
result.genreCount = new Map()
let detailMode = true

for (let i = 1; i <= lastPage; i++) {
  let doc = new DOMParser().parseFromString(fetchUrl(baseUrl + i), 'text/html')
  if (i == 1) {
    console.log(`取得中 ${i}ページ目`)
    let lastPageElm = doc.querySelector('.page_no ul li:last-child a')
    if (lastPageElm) {
      lastPage = parseInt(lastPageElm.dataset.value)
    }
  } else {
    console.log(`取得中 ${i}/${lastPage}ページ目`)
  }
  let trElms = doc.querySelectorAll('.work_list_main tr:not(.item_name)')
  trElms.forEach((elm) => {
    let work = new Object()

    if (elm.querySelector('.work_name a') == null) {
      work.url = ''
    } else {
      work.url = elm.querySelector('.work_name a').href
    }

    work.date = elm.querySelector('.buy_date').innerText
    work.name = elm.querySelector('.work_name').innerText.trim()
    work.genre = elm.querySelector('.work_genre span').textContent.trim()
    work.price = parseInt(
      elm.querySelector('.work_price').innerText.replace(/\D/g, '')
    )

    work.makerName = elm.querySelector('.maker_name').innerText.trim()

    if (detailMode && work.url != '') {
      console.log(`取得中 ${work.url}`)
      let docWork = new DOMParser().parseFromString(
        fetchUrl(work.url),
        'text/html'
      )
      work.mainGenre = new Array()
      docWork.querySelectorAll('.main_genre a').forEach((a) => {
        let g = a.textContent
        work.mainGenre.push(g)
        if (!result.genreCount.has(g)) {
          result.genreCount.set(g, 0)
        }
        result.genreCount.set(g, result.genreCount.get(g) + 1)
      })
    }

    result.count++
    result.totalPrice += work.price
    result.works.push(work)
  })
}

result.genreCount = new Map(
  [...result.genreCount.entries()].sort(([, idA], [, idB]) => idB - idA)
)

let ranking = ''
result.genreCount.forEach((value, key) => {
  ranking += key + ':' + value + ' '
})

console.log(JSON.stringify(result))
console.log(`完了 作品数:${result.count} 合計金額:${result.totalPrice}`)
console.log('ジャンル 多かった順\n' + ranking)

function fetchUrl(url) {
  let request = new XMLHttpRequest()
  request.open('GET', url, false)
  request.withCredentials = true
  request.send(null)
  return request.responseText
}
