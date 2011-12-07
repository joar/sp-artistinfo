var sp = getSpotifyApi(1);

var app = {
    defaultAlbumCover: 'img/album-300.png',
    getCoverURL: function (track) {
	return track.album.cover || this.defaultAlbumCover;
    },
    updateNowPlaying: function() {
	console.log('Updating...');
	var np = sp.trackPlayer.getNowPlayingTrack();

	this.viewModel.npCoverURL(this.getCoverURL(np.track));
	this.viewModel.npTrack(np.track.name);
	this.viewModel.npArtists(np.track.artists);
	this.viewModel.npAlbum(np.track.album);
	this.getWikiPage(np.track.artists[0].name);
    },
    getWikiPage: function (artist) {
	//http://en.wikipedia.org/w/api.php?action=parse&section=0&prop=text&page=pizza&format=json
	console.log('Requesting...');
	$.getJSON(
//	    'http://en.wikipedia.org/w/api.php?action=parse&section=0&prop=text&page='
	    'http://en.wikipedia.org/w/api.php?action=parse&prop=text&page='
		+ escape(artist)
		+ '&format=json&callback=?',
	    function (data, status, xhr) {
		console.log('Got response!');
		console.log(status, xhr);
		console.log(data);
		if ( ! data.error ) {
		    app.viewModel.npInfo(
			data.parse.text['*'].replace(/"\/\//g, "\"http://").replace(/href="/g, "rel=\"extern\" href=\"").replace(/href="\/wiki/g, 'href="http://en.wikipedia.org/wiki'));
		} else {
		    app.viewModel.npInfo(
			'Error: ' + data.error.info);
		}
	    });
    }
}

app.viewModel = {
    heading: ko.observable('Now playing'),
    npTrack: ko.observable('<song>'),
    npArtists: ko.observableArray([{
	name: '<artist>',
	uri: 'spotify:artist:blah'
    }]),
    npAlbum: ko.observable('<album>'),
    npCoverURL: ko.observable(app.defaultAlbumCover),
    npInfo: ko.observable('')
};

app.init = function () {
    $(document).ready(function () {
	console.log('Applying bindings...');
	ko.applyBindings(app.viewModel);

	app.updateNowPlaying();

	sp.trackPlayer.addEventListener("playerStateChanged", function (event) {
		
		// Only update the page if the track changed
		if (event.data.curtrack == true) {
			app.updateNowPlaying();
		}
	});
    });
    return this;
}

exports.init = app.init;
