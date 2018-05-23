const randomColor = () => {
    let colors = '0123456789ABCDEF'; /*todo: put colors array here*/
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += colors[Math.floor(Math.random() * colors.length)];
    }
    return color;
}

const getSongTemplate = (song) => {
    const {id, imageUrl, author, title, category, durationTime} = song;

    return `<span class="song-avatar" style="background-color: ${randomColor()}
            ${imageUrl ? `background-image: url(/static/images/${imageUrl}")` : ''}"
            >${id}</span>
            <span class="title">${title}</span>
            <span class="author">${author}</span>
            <span class="category">${category}</span>
            <span class="duration">${durationTime}</span>
    
            <select class="rating" id="${id}-${Math.floor(Math.random()*12345)}">
            <option disabled selected value></option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            
            <span class="play">
                <img src="/static/images/Play.png" alt="Play"/>
            </span>`;
}
const getSongsResults = (container, songs) => {
    songs.map(song => {
        const newListElement = document.createElement('li');
        newListElement.innerHTML = getSongTemplate(song);
        container.appendChild(newListElement);

        let newListElementSelect = newListElement.querySelector('.rating');
        applyRating(newListElementSelect, song.id, getCookie('user'));
    })
}

const setWelcomeText = () => {
    const welcomeText = document.querySelector('#welcome-text');

    if(getCookie('user')) {
        getUser(getCookie('user'))
            .then(user => {
                welcomeText.innerText = `Hi, ${user.name}!`;
            })
    }
    else {
        welcomeText.innerText = 'Sign in and get your personalized music!'
    }
}

const showRecommendations = () => {
    const similarityRecommendationsContainer = document.querySelector('.similarity-recommendations .list');
    const svdRecommendationsContainer = document.querySelector('.svd-recommendations .list');
    const reducedSvdRecommendationsContainer = document.querySelector('.reduced-svd-recommendations .list');

    if (getCookie('user')) {
        getUsersRecommendationsBySimilarity(getCookie('user'))
            .then(recommendations => {
                Promise.all(
                    recommendations.map(element => getSong(element.id))
                )
                    .then(songs => {
                        if(songs.length) {
                            getSongsResults(similarityRecommendationsContainer, songs)
                        } else {
                            similarityRecommendationsContainer.innerText = 'We don\'t know what you like. Rate something to tell us!';
                        }
                    })
            });
        getUsersRecommendationsBySvd(getCookie('user'))
            .then(recommendations => {
                Promise.all(
                    recommendations.map(element => getSong(element.id))
                )
                    .then(songs => {
                        if(songs.length) {
                            getSongsResults(svdRecommendationsContainer, songs)
                        } else {
                            svdRecommendationsContainer.innerText = 'We don\'t know what you like. Rate something to tell us!';
                        }
                    })
            });
        getUsersRecommendationsByReducedSvd(getCookie('user'))
            .then(recommendations => {
                Promise.all(
                    recommendations.map(element => getSong(element.id))
                )
                    .then(songs => {
                        if(songs.length) {
                            getSongsResults(reducedSvdRecommendationsContainer, songs)
                        } else {
                            reducedSvdRecommendationsContainer.innerText = 'We don\'t know what you like. Rate something to tell us!';
                        }
                    })
            });
    } else {
        document.querySelectorAll('.recommendations').forEach((section) => {
            section.style.display = 'none'
        })
    }
}

const menuUpdate = () => {
    const logoutButton = document.querySelector('#logout');
    const signInButton = document.querySelector('a[href="/sign-in"]');

    if(getCookie('user')) {
        logoutButton.style.display = 'block'
        logoutButton.addEventListener('click', (event) => {
            setLoggedUserId(0)
            refreshPage()
        })
        signInButton.style.display = 'none'
    } else {
        logoutButton.style.display = 'none'
        signInButton.style.display = 'block'
    }
}

const refreshPage = () => {
    const whatsNewContainer = document.querySelector('.whats-new .list');
    getAllSongs()
        .then(songs => getSongsResults(whatsNewContainer, songs));

    const topSongsContainer = document.querySelector('.top-songs .list');
    getTopSongs(5)
        .then(topSongs => getSongsResults(topSongsContainer, topSongs));

    setWelcomeText();
    showRecommendations();
    menuUpdate();
}