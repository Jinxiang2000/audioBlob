function preventEvent(e) {
    e.stopPropagation();
    e.preventDefault();
}
function savePlayingInfo(name, currentTime) {
    return sessionStorage.setItem(PLAYING_ITEM_INFO_KEY, JSON.stringify({ name, currentTime }));
}
function getPreviousPlayingInfo() {
    return JSON.parse(sessionStorage.getItem(PLAYING_ITEM_INFO_KEY) || null);
}
const PLAYING_ITEM_INFO_KEY = 'playingItemInfo'
const model = {
    fileObj: null,
    blobUrl: null,
    memoryFileObj(f) {
        model.fileObj = f;
        model.convertBlobUrl();
    },
    convertBlobUrl() {
        if (!model.fileObj) {
            return null;
        } else if (model.blobUrl) {
            return model.blobUrl;
        }
        model.blobUrl = URL.createObjectURL(model.fileObj);
        return model.blobUrl;
    },
};
const fileSelectorComponent = {
    view(vnode) {
        const visibleSetting = vnode.attrs.visible ? {} : { style: { display: 'none' }};
        return m(
            'input',
            {
                type: 'file',
                ...visibleSetting ,
                onchange(e) {
                    const fileObj = e.target.files[0];
                    model.memoryFileObj(fileObj);
                },
            }
        );
    },
};
const itemComponent = {
    view() {
        return m(
            '#item-wrapper',
            {
                style: {
                    width: '100%',
                    height: '100%',
                    background: '#d2d2d2',
                },
                ondragenter: preventEvent,
                ondragover: preventEvent,
                ondrop(e) {
                    preventEvent(e);
                    const fileObj = e.dataTransfer.files[0];
                    model.memoryFileObj(fileObj);
                },
                onclick(e) {
                    // SO EVIL WAY.
                    document.querySelector('input').click();
                }
            },
            [
                m('span', 'Please select or drop an audio file'),
                m(fileSelectorComponent, { visible: false }),
            ],
        );
    },
};
const audioComponent = {
   oninit(vnode) {
       const previousPlayingInfo = getPreviousPlayingInfo();
       if (!previousPlayingInfo) return;
       vnode.state.currentTime = model.fileObj.name === previousPlayingInfo.name ? previousPlayingInfo.currentTime : 0;
   },
   view(vnode) {
        function saveCurrentPosition() {
            savePlayingInfo(model.fileObj.name, vnode.dom.currentTime);
        }
        return m('audio',
            {
                controls: 'true',
                src: model.blobUrl,
                currentTime: vnode.state.currentTime,
                onplay: saveCurrentPosition,
                onpause: saveCurrentPosition,
                onseeked: saveCurrentPosition,
            }
        )
    },
};
const playerComponent = {
    view(vnode) {
        return m('div', [
            m('figure', [
                m('figcaption', model.fileObj.name),
                m(audioComponent),
            ]),
            m('p'),
            m(fileSelectorComponent, { visible: true }),
        ]);
    },
};
const rootComponent = {
    view() {
        return m(model.fileObj ? playerComponent : itemComponent)
    },
};
m.mount(document.getElementById('app'), rootComponent);