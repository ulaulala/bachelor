const applyRating = (element, songId, userId) => {
    $(element).barrating({
        theme: 'css-stars',
        onSelect: function(value, text, event) {
            if (typeof(event) !== 'undefined') {
                if(!isNaN(parseInt(value)) && getCookie('user')) {
                    setRateForSong(userId, songId, parseInt(value));
                    console.log(userId, songId, parseInt(value),typeof parseInt(value), 'setted')
                } else {
                    deleteRateForSong(userId, songId);
                    console.log(userId, songId, parseInt(value),typeof parseInt(value), 'deleted')

                }
                console.log(userId, songId, parseInt(value))
            }
    }}
    );

    getUserRateForSong(userId, songId)
        .then((rating) => {
            if(!rating.length) {
                $(element).barrating('clear');
            }
            else {
                $(element).barrating('set', rating[0].songRate);
            }
        })

};
