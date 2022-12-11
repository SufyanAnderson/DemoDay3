function denyRequest(postid, userid) {
    fetch('/post/denyRequest', {
        method: 'put',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            '_id': postid,
            'userid': userid
        })
    }).then(function (response) {
        window.location.reload()
    })
}