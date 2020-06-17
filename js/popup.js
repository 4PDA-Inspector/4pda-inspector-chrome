popup = {

	refreshImgRotateInterval: 0,

	elements: {
		usernameLabel: null,
		favoritesBox: null,
		favoritesLabel: null,
		mentionsBox: null,
		mentionsLabel: null,
		qmsBox: null,
		qmsLabel: null,
		themesList: null,
		settingsLabel: null,
		openAllLabel: null,
		openAllPinLabel: null,
		readAllLabel: null,
		manualRefresh: null
	},

	urls: {
		login: 'https://4pda.ru/forum/index.php?act=login'
	},

	bg: null,

	init: function() {
		this.bg = chrome.extension.getBackgroundPage().inspector4pda;

		if (!this.bg.user.id) {
			this.bg.utils.openPage(this.urls.login, true);
			window.close();
			return false;
		}

		if (this.bg.vars.data.toolbar_width_fixed) {
			document.getElementsByTagName("body")[0].style.width = Math.min(this.bg.vars.data.toolbar_width, 790);
			document.getElementsByTagName("body")[0].className = 'widthFixed';
		}
		
		this.elements.usernameLabel = document.getElementById('panelUsername');
		this.elements.usernameLabel.addEventListener("click", function () {
			popup.bg.user.open();
			popup.checkOpenthemeHiding();
		}, false);
		
		this.elements.mentionsLabel = document.getElementById('panelMentionsCount');
		this.elements.mentionsBox = document.getElementById('panelMentions');
		this.elements.mentionsBox.addEventListener("click", function () {
			popup.bg.mentions.openPage();
			popup.checkOpenthemeHiding();
		}, false);

		this.elements.favoritesLabel = document.getElementById('panelFavoritesCount');
		this.elements.favoritesBox = document.getElementById('panelFavorites');
		this.elements.favoritesBox.addEventListener("click", function () {
			popup.bg.themes.openPage();
			popup.checkOpenthemeHiding();
		}, false);

		this.elements.qmsLabel = document.getElementById('panelQMSCount');
		this.elements.qmsBox = document.getElementById('panelQMS');
		this.elements.qmsBox.addEventListener("click", function () {
			popup.bg.QMS.openPage();
			popup.checkOpenthemeHiding();
		}, false);

		this.elements.settingsLabel = document.getElementById('panelSettings');
		this.elements.settingsLabel.addEventListener("click", function () {
			popup.bg.utils.openPage(chrome.extension.getURL('/html/options.html'), true);
		}, false);

		this.elements.openAllLabel = document.getElementById('panelOpenAll');
		this.elements.openAllLabel.addEventListener('click', function() {
			popup.bg.themes.openAll();
			popup.checkOpenthemeHiding();
			popup.refresh();
		}, false);
		
		this.elements.openAllPinLabel = document.getElementById('panelOpenAllPin');
		this.elements.openAllPinLabel.addEventListener('click', function() {
			popup.bg.themes.openAllPin();
			popup.checkOpenthemeHiding();
			popup.refresh();
		}, false);
		
		this.elements.readAllLabel = document.getElementById('panelReadAll');
		this.elements.readAllLabel.addEventListener('click', function() {
			popup.bg.themes.readAll();
			popup.checkOpenthemeHiding();
			popup.refresh();
		}, false);

		this.elements.themesList = document.getElementById('themesList');

		this.elements.manualRefresh = document.getElementById('panelRefresh');
		this.elements.manualRefresh.addEventListener('click', function() {
			popup.manualRefresh(true);
		}, false);

		this.refresh();
	},

	refresh: function(withoutPrintThemes) {
		this.elements.usernameLabel.textContent = inspector4pda.utils.htmlspecialcharsdecode(this.bg.user.name);
		
		this.elements.favoritesLabel.textContent = this.bg.themes.getCount();
		this.elements.favoritesBox.className = this.bg.themes.getCount() ? 'hasUnread': '';

		this.elements.qmsLabel.textContent = this.bg.QMS.getCount();
		this.elements.qmsBox.className = this.bg.QMS.getCount() ? 'hasUnread': '';

        this.bg.mentions.request(function(mCount){
            popup.elements.mentionsLabel.textContent = mCount;
            popup.elements.mentionsBox.className = mCount ? 'hasUnread': '';
        });

		if (popup.bg.vars.data.toolbar_simple_list) {
			this.elements.themesList.className = 'simpleList';
		}

		if (!this.bg.vars.data.toolbar_openAllFavs_button) {
			this.elements.openAllLabel.classList.add('hidden');
		}
		if (!this.bg.vars.data.toolbar_openAllFavs_button || (this.bg.vars.data.toolbar_only_pin ||  !this.bg.themes.getPinCount())) {
			this.elements.openAllPinLabel.classList.add('hidden');
		}
		if (!this.bg.vars.data.toolbar_markAllAsRead_button) {
			this.elements.readAllLabel.classList.add('hidden');
		}

		if (popup.bg.vars.data.user_links && popup.bg.vars.data.user_links.length) {
			let self = this;
			setTimeout(function () {
				self.printUserLinks();
			}, 50);
		}

		if (!withoutPrintThemes) {
			this.printThemesList();
		}

		clearInterval(this.refreshImgRotateInterval);
		this.elements.manualRefresh.style.transform = "rotate(0deg)";
	},

	manualRefresh: function() {
		clearInterval(this.refreshImgRotateInterval);
		var refreshImgRotate = 0;
		popup.refreshImgRotateInterval = setInterval(function() {
			refreshImgRotate += 10;
			popup.elements.manualRefresh.style.transform = "rotate("+refreshImgRotate+"deg)";
		}, 30);

		this.bg.cScript.firstRequest(function() {
			clearInterval(popup.refreshImgRotateInterval);
			popup.refresh();
		});
	},

	printCount: function() {
		this.refresh(true);
	},

	clearThemesList: function() {
		this.elements.themesList.textContent = "";
	},

	printThemesList: function() {
		this.clearThemesList();

		if (this.bg.themes.getCount()) {
			let themesKeys = this.bg.themes.getSortedKeys();
			for (let i = 0; i < themesKeys.length; i++) {
				this.addThemeRow(this.bg.themes.list[themesKeys[i]]);
			}
		} else {
			let noThemesLabel = document.createElement('div');
			noThemesLabel.textContent = inspector4pda.browser.getString('No unread topics');
			noThemesLabel.className = 'oneTheme';
			this.elements.themesList.appendChild(noThemesLabel);
		}
	},

	addThemeRow: function(theme) {
		this.elements.themesList.appendChild(this.createThemeRow(theme));
	},

	createThemeRow: function(theme)	{
		var themeCaptionLabel = document.createElement('span');
		themeCaptionLabel.textContent = inspector4pda.utils.htmlspecialcharsdecode(theme.title);
		themeCaptionLabel.className = 'oneTheme_caption';
		if (theme.pin && popup.bg.vars.data.toolbar_pin_color) {
			themeCaptionLabel.className += ' oneTheme_pin';
		}
		themeCaptionLabel.id = 'oneThemeCaption_' + theme.id;
		themeCaptionLabel.dataId = theme.id;
		themeCaptionLabel.addEventListener("click", function () {
			popup.bg.themes.open(theme.id);
			popup.bg.cScript.printCount();
			popup.elements.favoritesLabel.textContent = popup.bg.themes.getCount();
			this.classList.add("readed");
			popup.checkOpenthemeHiding();
		}, false);

		let readImage = document.createElement('span');
		readImage.className = 'oneTheme_markAsRead';
		readImage.setAttribute('data-theme', theme.id);
		readImage.setAttribute('title', inspector4pda.browser.getString('Mark As Read'));
		readImage.addEventListener("click", function () {
			var current = this,
				dataTheme = this.getAttribute('data-theme');
			current.classList.add('loading');
			popup.bg.themes.read(dataTheme, function() {
				current.classList.remove('loading');
				document.getElementById('oneThemeCaption_' + theme.id).classList.add('readed');
				popup.bg.cScript.printCount();
				popup.printCount();
			});
		});

		if (popup.bg.vars.data.toolbar_simple_list) {
			let mainHBox = document.createElement('div');
			mainHBox.className = 'oneTheme';
			//themeCaptionLabel.setAttribute('flex', '1');
			mainHBox.appendChild(themeCaptionLabel);
			mainHBox.appendChild(readImage);
			return mainHBox;
		} else {

			let userCaptionLabel = document.createElement('span');
			userCaptionLabel.textContent = inspector4pda.utils.htmlspecialcharsdecode(theme.last_user_name);
			userCaptionLabel.className = 'oneTheme_user';

			let lastPostLabel = document.createElement('span');
			lastPostLabel.textContent = new Date(theme.last_post_ts*1000).toLocaleString();
			lastPostLabel.className = 'oneTheme_lastPost';
			lastPostLabel.setAttribute('title', inspector4pda.browser.getString('Open Last Post'));
			lastPostLabel.addEventListener("click", function () {
				popup.bg.themes.openLast(theme.id);
				popup.bg.cScript.printCount();
				popup.printCount();
				document.getElementById('oneThemeCaption_' + theme.id).classList.add('readed');
			}, false);

			// BOXES

			let infoHBox = document.createElement('div');
			infoHBox.className = 'oneThemeInfoHBox';
			infoHBox.appendChild(userCaptionLabel);
			infoHBox.appendChild(lastPostLabel);

			infoHBox.appendChild(readImage);

			let mainHBox = document.createElement('div');
			mainHBox.appendChild(themeCaptionLabel);

			let themeVBox = document.createElement('div');
			themeVBox.className = 'oneTheme';
			themeVBox.appendChild(mainHBox);
			themeVBox.appendChild(infoHBox);
			return themeVBox;
		}
	},

	checkOpenthemeHiding: function()
	{
		if (this.bg.vars.data.toolbar_opentheme_hide) {
			window.close();
		}
	},

	printUserLinks: function() {
		var uLinks = document.getElementById('userLinks');
		uLinks.textContent = '';
		for (let i = 0; i < popup.bg.vars.data.user_links.length; i++) {
			let item = popup.bg.vars.data.user_links[i];
			if (typeof item != 'object') {
				continue;
			}
			let link = document.createElement('span');
			link.innerText = item.title;
			link.setAttribute('data-url', item.url);
			link.addEventListener("click", function () {
				var url = this.getAttribute('data-url');
				popup.bg.utils.openPage(url, true);
			}, false);
			uLinks.appendChild(link);
		}
		uLinks.style.display = 'block';
	}
};

popup.init();