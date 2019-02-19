
/*---------- Query Selectors -----------*/
var searchInput = document.querySelector('#search-input');
var titleInput = document.querySelector('#title-input');
var bodyInput = document.querySelector('#body-input');
var saveBtn = document.querySelector('#save-button');
var seeMoreBtn = document.querySelector('.see-more-btn');
var ideaArea = document.querySelector('#idea-area');
var ideaTemplate = document.querySelector('template');

/*---------- Global Variables -----------*/
var qualities = ['Swill', 'Plausible', 'Genius'];

/*---------- Event Listeners -----------*/
saveBtn.addEventListener('click', createIdea);
seeMoreBtn.addEventListener('click', toggleCardView);
searchInput.addEventListener('input', searchIdeas);

/*---------- Functions -----------------*/
function getIdeas() {
  var ideasString = localStorage.ideas || '[]';
  return JSON.parse(ideasString);
}

function getIdeaIndex(e, ideas) {
  var parent = e.target.closest('article');
  var parentID = parseInt(parent.dataset.id);
  var index = ideas.findIndex(function(idea) {
    return idea.id === parentID;
  });
  return index;
}

function reinstateIdea(ideas, i) {
  return new Idea(ideas[i].id, ideas[i].title, ideas[i].body, ideas[i].quality);
}

function storeIdeas(ideas) {
  localStorage.ideas = JSON.stringify(ideas);
}

function createIdea(e) {
  e.preventDefault();
  var ideas = getIdeas();
  var newIdea = new Idea(Date.now(), titleInput.value, bodyInput.value);
  newIdea.saveToStorage(ideas);
  storeIdeas(ideas);
  addRecentIdeas(10);
}

function addIdeaListeners(clone) {
  clone.querySelector('.idea-title').addEventListener('blur', saveEdits);
  clone.querySelector('.idea-body').addEventListener('blur', saveEdits);
  clone.querySelector('.delete-icon').addEventListener('click', removeIdeaCard);
  clone.querySelector('.upvote-icon').addEventListener('click', vote);
  clone.querySelector('.downvote-icon').addEventListener('click', vote);
}

function addIdeaCard(idea) {
  var ideaClone = ideaTemplate.content.cloneNode(true)
  addIdeaData(ideaClone, idea);
  addIdeaListeners(ideaClone);
  ideaArea.insertBefore(ideaClone, ideaArea.firstChild);
  titleInput.value = '';
  bodyInput.value = '';
}

function addIdeaData(clone, idea) {
  clone.querySelector('article').dataset.id = idea.id;
  clone.querySelector('.idea-title').innerText = idea.title;
  clone.querySelector('.idea-body').innerText = idea.body;
  clone.querySelector('.idea-quality').innerText = qualities[idea.quality];

}

function saveEdits(e) {
  var ideas = getIdeas();
  var i = getIdeaIndex(e, ideas);
  var ideaToChange = reinstateIdea(ideas, i);
  ideaToChange.updateContent(e.target.innerText, e.target.classList);
  ideas[i] = ideaToChange;
  storeIdeas(ideas);
}

function vote(e) {
  var ideas = getIdeas();
  var i = getIdeaIndex(e, ideas);
  var ideaToVote = reinstateIdea(ideas, i);
  if (e.target.className === 'upvote-icon') {
    ideaToVote.updateQuality('upvote');
  } else if (e.target.className === 'downvote-icon') {
    ideaToVote.updateQuality('downvote');
  };
  ideas[i] = ideaToVote;
  storeIdeas(ideas);
  addRecentIdeas(10);
}

function searchIdeas(e) {
  e.preventDefault();
  var searchQuery = searchInput.value.toLowerCase();
  var ideas = getIdeas();
  var searchResults = ideas.filter(function(idea) {
    return idea.title.toLowerCase().includes(searchQuery) || idea.body.toLowerCase().includes(searchQuery);
  });
  ideaArea.innerHTML = '';
  searchResults.forEach(function(idea) {
    addIdeaCard(idea);
  });
}

function addRecentIdeas(numIdeas) {
  ideaArea.innerHTML = '';
  var ideas = getIdeas();
  var recentIdeas = ideas.slice(ideas.length - numIdeas, ideas.length);
  recentIdeas.forEach(function(idea) {
    addIdeaCard(idea)
  });
}

function toggleCardView(e) {
  event.preventDefault();
  if (seeMoreBtn.innerText === 'See More') {
    addRecentIdeas(getIdeas().length);
    seeMoreBtn.innerText = 'See Less';
  } else {
    addRecentIdeas(10);
    seeMoreBtn.innerText = 'See More';
  }
}

function removeIdeaCard(e) {
  if (e.target.className === 'delete-icon') {
    e.target.closest('article').remove();
    var ideas = getIdeas();
    var i = getIdeaIndex(e, ideas);
    var ideaToDelete = reinstateIdea(ideas, i);
    ideaToDelete.deleteFromStorage(ideas, i);
  };
  storeIdeas(ideas);
  addRecentIdeas(10);
}

window.onload = addRecentIdeas(10);
