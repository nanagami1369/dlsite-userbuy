const baseUrl =
  'https://www.dlsite.com/maniax/mypage/userbuy/=/type/all/start/all/sort/1/order/1/page/'
let lastPage = 1
const result = {
  count: 0,
  totalPrice: 0,
  works: [],
  genreCount: new Map(),
  makerCount: new Map(),
  eol: [],
}
let detailMode = true

const parser = new DOMParser()

// ページ走査
for (let i = 1; i <= lastPage; i++) {
  const doc = parser.parseFromString(fetchUrl(baseUrl + i), 'text/html')
  if (i == 1) {
    console.log(`取得中 ${i}ページ目`)
    const lastPageElement = doc.querySelector('.page_no ul li:last-child a')
    if (lastPageElement) {
      lastPage = parseInt(lastPageElement.dataset.value)
    }
  } else {
    console.log(`取得中 ${i}/${lastPage}ページ目`)
  }
  const trElement = doc.querySelectorAll('.work_list_main tr:not(.item_name)')
  trElement.forEach((elm) => {
    // 履歴の表の行走査
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
      const docWork = parser.parseFromString(fetchUrl(workUrl), 'text/html')
      docWork.querySelectorAll('.main_genre a').forEach((a) => {
        const g = a.textContent
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

    if (!result.makerCount.has(work.makerName)) {
      result.makerCount.set(work.makerName, 0)
    }
    result.makerCount.set(
      work.makerName,
      result.makerCount.get(work.makerName) + 1
    )

    result.count++
    result.totalPrice += work.price
    result.works.push(work)
    if (work.url == '') {
      result.eol.push(work)
    }
  })
}

result.genreCount = new Map(
  [...result.genreCount.entries()].sort(([, idA], [, idB]) => idB - idA)
)

result.makerCount = new Map(
  [...result.makerCount.entries()].sort(([, idA], [, idB]) => idB - idA)
)

let genreRanking = ''
result.genreCount.forEach((value, key) => {
  genreRanking += key + ':' + value + ' '
})

let makerRanking = ''
result.makerCount.forEach((value, key) => {
  makerRanking += key + ':' + value + ' '
})

console.log(JSON.stringify(result))
console.log(`完了 作品数:${result.count} 合計金額:${result.totalPrice}`)
console.log('ジャンル 多かった順\n' + genreRanking)
console.log('サークル 多かった順\n' + makerRanking)

if (result.eol.length > 0) {
  var str = `販売終了作品数:${result.eol.length}\n`
  result.eol.forEach((work) => {
    str += `${work.date} ${work.makerName} - ${work.name}\n`
  })
  console.log(str)
}

function fetchUrl(url) {
  const request = new XMLHttpRequest()
  request.open('GET', url, false)
  request.withCredentials = true
  request.send(null)
  return request.responseText
}
