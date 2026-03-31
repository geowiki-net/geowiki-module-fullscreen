/* global L:false */
import modulekitLang from 'modulekit-lang'

let app
module.exports = {
  id: 'fullscreen',
  scope: 'geowiki-app',
  requireModules: ['map'],
  appInit: (_app) => {
    app = _app

    app.on('map-init', map => {
      map.addControl(new FullscreenControl())
    })
  }
}

const FullscreenControl = L.Control.extend({
  options: {
    position: 'topleft'
    // control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
  },
  onAdd: function (map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control-fullscreen')
    container.innerHTML = "<a href='#'><i class='fa fa-expand'></i></a>"
    container.title = modulekitLang.lang('toggle_fullscreen')

    container.onclick = function () {
      const dom = document.body

      if (dom.requestFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen()

          app.emit('fullscreen-deactivate', map)
        } else {
          dom.requestFullscreen()
          document.body.classList.add('fullscreen')

          app.emit('fullscreen-activate', map)
        }
      } else {
        document.body.classList.toggle('fullscreen')

        app.emit('fullscreen-' + (document.body.classList.contains('fullscreen') ? 'activate' : 'deactivate'), map)
      }

      app.map.invalidateSize()
      return false
    }

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        document.body.classList.remove('fullscreen')
        app.map.invalidateSize()

        app.emit('fullscreen-deactivate', map)
      }
    })

    return container
  }
})
