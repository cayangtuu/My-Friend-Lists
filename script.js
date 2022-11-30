const Base_URL = "https://lighthouse-user-api.herokuapp.com";
const Index_URL = Base_URL + "/api/v1/users/";
const List = document.querySelector("#friend-list");
const searchForm = document.querySelector("#search-form");
const pageNum = document.querySelector(".pagination");
const likeList = JSON.parse(localStorage.getItem("likeFriends")) || [];
const friends = [];
const Friends_Per_Page = 12;
let showPage = 1;
const maxshowPage = 3;

// function listClick：按下特定卡片上的按鈕後會執行對應動作，若按下"..."會呼叫showInformCard函式；若按下"愛心"會呼叫add_or_removeLikeCard函式
function listClick(event) {
  const cardId = Number(event.target.dataset.cardId);
  if (event.target.matches(".btn-show-inform")) {
    showInformCard(cardId)
  } else if (event.target.matches(".btn-add-like")) {
    add_or_removeLikeCard(cardId)
  }
}

// function showInformCard：針對選取之特定卡片，連線至api並透過modal呈現該卡片之朋友的詳細資料
function showInformCard(cardId) {
  const modalTitle = document.querySelector("#card-modal-title");
  const modalImage = document.querySelector("#card-modal-image");
  const modalInform = document.querySelector("#card-modal-inform");

  modalTitle.innerText = ``;
  modalImage.src = ``;
  modalInform.innerHTML = ``;

  axios
    .get(Index_URL + cardId)
    .then((response) => {
      const data = response.data;
      modalTitle.innerText = `${data.name} ${data.surname}`;
      modalImage.src = data.avatar;
      modalInform.innerHTML = `
        <li>Age: ${data.age}</li>
        <li>Gender: ${data.gender}</li>
        <li>Region: ${data.region}</li>
        <li>Birthday: ${data.birthday}</li>
        <li>Email: ${data.email}</li>
      `;
    })
    .catch((err) => console.log(err));
}

// function add_or_removeLikeCard：針對選取之特定卡片，將其加入或移出localStorage的LikeList清單中(按一下可進行加入/移出)
function add_or_removeLikeCard(cardId) {
  const likeFriend = friends.find(friend => friend.id === cardId);
  if (likeList.some(friend => friend.id === cardId)) {
    let index = likeList.findIndex(friend => friend.id === cardId);
    likeList.splice(index, 1)
  } else {
    likeList.push(likeFriend)
  }
  localStorage.setItem("likeFriends", JSON.stringify(likeList))
}

// function searchFormSubmit：輸入搜尋欄位並按下按鈕後，可進行朋友名字搜尋
function searchFormSubmit(event) {
  event.preventDefault();
  const searchInput = document.querySelector("#search-input");
  const searchName = searchInput.value.trim().toLowerCase()
  const filterFriends = friends.filter(friend => (friend.name.toLowerCase().includes(searchName) || friend.surname.toLowerCase().includes(searchName)))
  displayList(filterFriends)
}

// function renderWeb：將透過api獲取資料並存進friends變數中，呼叫displayList函式及render_heart_icon函式，將卡片結果進行網頁渲染
function renderWeb() {
  axios
    .get(Index_URL)
    .then((response) => {
      friends.push(...response.data.results)
      setPagination(showPage)
      displayList(getMoviesByPage(1))
      render_heart_icon()
    })
    .catch((err) => console.log(err));
}

// function displayList：將每個卡片資料撰寫進HTML中，並放進List.innerHTML當中
function displayList(datas) {
  let listHTML = ``;
  datas.forEach((data) => {
    listHTML += `
      <div class="card text-center mb-2 mx-1">
        <img class="card-img-top" src="${data.avatar}" alt="friend-photo">
        <h5 class="card-title mt-1 fs-6">${data.name} ${data.surname}</h5>
        <div class="card-footer">
          <button type="button" class="btn btn-show-inform" data-card-id="${data.id}" data-bs-toggle="modal" data-bs-target="#card-modal">
            <i class="fa-solid fa-ellipsis btn-show-inform" data-card-id="${data.id}" style="font-size: 1.5em"></i>
          </button>  
          <button type="button" class="btn" data-card-id="${data.id}">
            <i onclick="change_heart_icon(this)" class="fa-regular fa-heart btn-add-like" data-card-id="${data.id}" id="${data.id}" style="font-size: 1.5em"></i> 
          </button>
        </div>
      </div>
    `;
  });
  List.innerHTML = listHTML;
}

// function render_heart_icon：渲染網頁時，查詢localStorage中是否有LikeList清單，為LikeList清單中的朋友其"空心愛心"變換為"實心紅色愛心"
function render_heart_icon() {
  if (likeList === []) return
  likeList.forEach(friend => {
    let friendId = document.getElementById(friend.id)
    if (friendId) {
      friendId.classList.remove("fa-regular")
      friendId.classList.add("fa-solid", "text-danger")
    }
  })
}

// function change_heart_icon：進行愛心圖形的切換(toggle)，按下按鈕若為"空心愛心"則變換為"實心紅色愛心"，反之相反。與add_or_removeLikeCard函式將相互對應。
function change_heart_icon(icon) {
  icon.classList.toggle("fa-regular")
  icon.classList.toggle("fa-solid")
  icon.classList.toggle("text-danger")
}

// function paginationClick：按下分頁按鈕時，渲染特定分頁之網頁
function paginationClick(event) {
  if (event.target.classList.contains("page-num")) {
    const page = event.target.dataset.page;
    displayList(getMoviesByPage(page))
    render_heart_icon()
  } else if (event.target.classList.contains("page-previous")) {
    if (showPage > 1) {
      showPage -= 1
      setPagination(showPage)
    }
  } else if (event.target.classList.contains("page-next")) {
    const maxPage = Math.ceil(friends.length / Friends_Per_Page);
    if (showPage <= maxPage - maxshowPage) {
      showPage += 1
      setPagination(showPage)
    }
  }
}

// function setPagination：製作網頁之分頁按鈕
function setPagination(showPage) {
  let pageHTML = `<li class="page-item"><a class="page-link page-previous" href="#">Previous</a></li>`;
  for (let page = showPage; page < showPage + maxshowPage; page++) {
    pageHTML += `
    <li class="page-item"><a class="page-link page-num" href="#" data-page="${page}">${page}</a></li>
    `
  }
  pageHTML += `<li class="page-item"><a class="page-link page-next" href="#">Next</a></li>`
  pageNum.innerHTML = pageHTML
}

// function getMoviesByPage：取得各分頁對應之朋友清單
function getMoviesByPage(page) {
  const startIndex = (page - 1) * Friends_Per_Page;
  return friends.slice(startIndex, startIndex + Friends_Per_Page, Friends_Per_Page)
}

// 增加監聽器，並渲染網頁
List.addEventListener("click", listClick);
searchForm.addEventListener("submit", searchFormSubmit);
pageNum.addEventListener("click", paginationClick);
renderWeb();