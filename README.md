# AWS HQ2 AI Experience Center demo

An interactive spatial concept built from eight photographs of the AI Experience Center. It combines a navigable Three.js reconstruction, a guided 60-second camera move, and a separate photographic film view using the original images.

## Run locally

```bash
npm install
npm run dev -- --port 5186 --strictPort --host 127.0.0.1
```

Open <http://127.0.0.1:5186/>. For a distributable build, run `npm run build`; the output is in `dist/` and must be served from a web server.

## Controls

- **Guided tour:** plays a six-stop camera path. Drag to look around temporarily; scroll to move along the tour. Use the timeline or numbered chapter rail to jump to a stop.
- **Free explore:** drag to look, scroll or use W/A/S/D or arrow keys to walk, and hold Shift to move faster.
- **Photo film:** plays a slow moving paired-photo sequence drawn from all eight source images. This is intentionally a photographic view, separate from the 3D model.
- **Photo references:** opens the original views for comparison. Fullscreen and optional ambient sound are available from the top and bottom controls.

## Reconstruction notes

The major visual anchors follow the photos and spatial corrections: the entry door faces the blue PROTO display across the vestibule, the AWS foliage sits beside PROTO, two TVs are evenly spaced on each side wall, and three sit beneath the AI Experience Center title. The brochure table is offset to the left of the doorway. The two rooms remain on the right. Polished concrete, charcoal panels, the warm wood ceiling lattice, and pendants complete the gallery. Exhibit screen and demo mural textures were perspective-corrected from the supplied photos. Concrete and wood surface maps were generated for this model to add texture under camera movement.

This is a hand-built architectural interpretation. Eight wide-angle photographs do not establish measured dimensions, hidden surfaces, or exact adjacency of the two side rooms. A survey, LiDAR scan, or overlapping video capture would be needed for a metrically faithful photogrammetry model.
