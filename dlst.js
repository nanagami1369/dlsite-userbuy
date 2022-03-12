let baseUrl =
  'https://www.dlsite.com/maniax/mypage/userbuy/=/type/all/start/all/sort/1/order/1/page/'
let lastPage = 1
let result = new Object()
result.count = 0
result.totalPrice = 0
result.works = new Array()
result.genreCount = new Map()
let detailMode = true

const parser = new DOMParser()

for (let i = 1; i <= lastPage; i++) {
  let doc = parser.parseFromString(fetchUrl(baseUrl + i), 'text/html')
  if (i == 1) {
    console.log(`取得中 ${i}ページ目`)
    let lastPageElement = doc.querySelector('.page_no ul li:last-child a')
    if (lastPageElement) {
      lastPage = parseInt(lastPageElement.dataset.value)
    }
  } else {
    console.log(`取得中 ${i}/${lastPage}ページ目`)
  }
  let trElement = doc.querySelectorAll('.work_list_main tr:not(.item_name)')
  trElement.forEach((elm) => {
    let workUrl = ''
    if (elm.querySelector('.work_name a') != null) {
      workUrl = elm.querySelector('.work_name a').href
    } else {
    }

    const workDate = elm.querySelector('.buy_date').innerText
    const workName = elm.querySelector('.work_name').innerText.trim()
    const workGenre = elm.querySelector('.work_genre span').textContent.trim()
    const workPrice = parseInt(
      elm.querySelector('.work_price').innerText.replace(/\D/g, '')
    )

    const workMakerName = elm.querySelector('.maker_name').innerText.trim()

    const workMainGenre = []
    if (detailMode && workUrl != '') {
      console.log(`取得中 ${workUrl}`)
      let docWork = parser.parseFromString(fetchUrl(workUrl), 'text/html')
      docWork.querySelectorAll('.main_genre a').forEach((a) => {
        let g = a.textContent
        workMainGenre.push(g)
        if (!result.genreCount.has(g)) {
          result.genreCount.set(g, 0)
        }
        result.genreCount.set(g, result.genreCount.get(g) + 1)
      })
    }

    const work = {
      url: workUrl,
      date: workDate,
      name: workName,
      genre: workGenre,
      price: workPrice,
      makerName: workMakerName,
      mainGenre: workMainGenre,
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
