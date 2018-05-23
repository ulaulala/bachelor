const API_HOST = '';
let LOGGED_USER_ID = 0;

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) {
        return parseInt(parts.pop().split(";").shift());
    }
}

console.log(getCookie('user'))

const setLoggedUserId = (newId) => {
    LOGGED_USER_ID = newId;
    document.cookie = 'user=' + newId;
}

const getAllSongs = () => {
    return fetch(`${API_HOST}/songs`)
        .then(response => {
            return response.json()
        })
        .catch(err => console.log(err));
}
const getSong = (id) => {
    return fetch(`${API_HOST}/songs/${id}`)
        .then(response => {
            return response.json()
        })
        .catch(err => console.log(err));
}
const getAllUsers = () => {
    return fetch(`${API_HOST}/users`)
        .then(response => {
            return response.json()
        })
        .catch(err => console.log(err));
}
const getUser = (id) => {
    return fetch(`${API_HOST}/users/${id}`)
        .then(response => {
            return response.json()
        })
        .catch(err => console.log(err));
}
getUserByName = (username) => {
    return fetch(`${API_HOST}/users/username/${username}`)
        .then(response => {
            return response ? response.json() : null
        })
        .catch(err => console.log(err));
}
const getAllRates = () => {
    return fetch(`${API_HOST}/rates`)
        .then(response => {
            return response.json()
        })
        .catch(err => console.log(err));
}
const getRatesForSpecificUser = (id) => {
    return fetch(`${API_HOST}/rates/user/${id}`)
        .then(response => {
            return response.json()
        })
        .catch(err => console.log(err));
}
const getUserRateForSong = (userId, songId) => {
    return fetch(`${API_HOST}/rates/user/${userId}/song/${songId}`)
        .then(response => {
            return response.json()
        })
        .catch(err => console.log(err));
}
const getTopSongs = (number) => {
    return fetch(`${API_HOST}/recommendations/top/${number}`)
        .then(response => {
            return response.json()
        })
        .catch(err => console.log(err));
}

const getUsersRecommendationsBySvd = (id) => {
    return fetch(`${API_HOST}/recommendations/svd/user/${id}`)
        .then(response => {
            return response.json()
        })
        .catch(err => console.log(err));
}

const getUsersRecommendationsByReducedSvd = (id) => {
    return fetch(`${API_HOST}/recommendations/reduced-svd/user/${id}`)
        .then(response => {
            return response.json()
        })
        .catch(err => console.log(err));
}

const getUsersRecommendationsBySimilarity = (id) => {
    return fetch(`${API_HOST}/recommendations/similarity/user/${id}`)
        .then(response => {
            return response.json()
        })
        .catch(err => console.log(err));
}

const setRateForSong = (userId, songId, songRate) => {
    return fetch(`${API_HOST}/rate/${songRate}/user/${userId}/song/${songId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: {
            "userId": userId,
            "songId": songId,
            "songRate": songRate
        }
    })
        .then(response => {
            return response.body;
        })
        .catch(err => console.log(err));
};

const deleteRateForSong = (userId, songId) => {
    return fetch(`${API_HOST}/delete-rate/user/${userId}/song/${songId}`, {
        method: 'DELETE'
    })
        .then(response => {
            return response.body;
        })
        .catch(err => console.log(err));
};

const registerNewUser = (userName, password) => {
    return fetch(`${API_HOST}/users/new/${userName}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "name": userName,
            "password": password
        })
    })
        .then(response => {
            return response.json().body
        })
        .catch(err => console.log(err));
};
