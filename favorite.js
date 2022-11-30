const Base_URL = "https://lighthouse-user-api.herokuapp.com";
const Index_URL = Base_URL + "/api/v1/users/";
const List = document.querySelector("#friend-list");
const searchForm = document.querySelector("#search-form");
const likeList = JSON.parse(localStorage.getItem("likeFriends")) || []

// function listClick：按下特定卡片上的按鈕後會執行對應動作，若按下"..."會呼叫showInformCard函式；若按下"愛心"會呼叫removeLikeCard函式，並進行網頁渲染
function listClick(event) {
  const cardId = Number(event.target.dataset.cardId);
  if (event.target.matches(".btn-show-inform")) {
    showInformCard(cardId)
  } else if (event.target.matches(".btn-add-like")) {
    removeLikeCard(cardId)
    displayList(likeList)
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

// function removeLikeCard：針對選取之特定卡片，將其移出localStorage的LikeList清單中(按一下可進行移出)
function removeLikeCard(cardId) {
  if (likeList.some(friend => friend.id === cardId)) {
    let index = likeList.findIndex(friend => friend.id === cardId)
    likeList.splice(index, 1)
  } else {
    return
  }
  localStorage.setItem("likeFriends", JSON.stringify(likeList))
}

// function renderWeb：將透過api獲取資料並存進friends變數中，呼叫displayList函式，將卡片結果進行網頁渲染
function renderWeb() {
  axios
    .get(Index_URL)
    .then((response) => {
      displayList(likeList);
    })
    .catch((err) => console.log(err));
}

// function displayList：將每個卡片資料撰寫進HTML中，並放進List.innerHTML當中
function displayList(datas) {
  listHTML = ``;
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
            <i class="fa-solid fa-heart text-danger btn-add-like" data-card-id="${data.id}" id="${data.id}" style="font-size: 1.5em"></i> 
          </button>
        </div>
      </div>
    `;
  });
  List.innerHTML = listHTML;
}

// 增加監聽器，並渲染網頁
List.addEventListener("click", listClick);
renderWeb();