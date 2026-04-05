/* global L:false */
import modulekitLang from 'modulekit-lang'
const lang = modulekitLang.lang
import './fullscreen.css'

let app
let mode = 'screen'
let hasFullscreen

module.exports = {
  id: 'fullscreen',
  scope: 'geowiki-app',
  requireModules: ['map'],
  appInit: (_app) => {
    app = _app

    hasFullscreen = !!document.body.requestFullscreen
    mode = hasFullscreen ? 'screen' : 'window'

    app.on('map-init', map => {
      map.addControl(new FullscreenControl())
    })

    app.on('options-form', form => {
      if (!hasFullscreen) { return }

      form.fullscreenMode = {
        name: lang('options:fullscreenMode'),
        type: 'select',
        placeholder: lang('default'),
        values: {
          'screen': lang('options:fullscreenMode:screen'),
          'window': lang('options:fullscreenMode:window'),
        }
      }
    })

    app.on('options-apply', options => {
      mode = options.fullscreenMode || (hasFullscreen ? 'screen' : 'window')
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
    container.innerHTML = "<a href='#'><i class='fa fa-maximize'></i></a>"
    container.title = modulekitLang.lang('toggle_fullscreen')

    container.onclick = function () {
      const dom = document.body

      if (mode === 'screen') {
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
