; Builds a comparison project: every body type we have on disk, stacked, with
; the garment art laid over each one.
;
; In GIMP: Filters > Script-Fu > Console, then
;
;   (load "C:/Users/nelim/Documents/rimworld/TailoredPants/_tools/gimp-compare.scm")
;   (tpc-open "south")     ; one facing, every body type in it
;   (tpc-open-all)         ; the three facings
;
; One image per facing. Inside it, one layer group per body type, and in each
; group, from the bottom up:
;
;   body       WDI's naked body, the shape everything has to fit
;   kas        the pants of General Textures Collection, as drawn
;   fitted     the same pants interpreted onto that body by make-garment.js,
;              where it has been generated - hidden by default
;
; Only the first group is visible. Toggle the eye on a group to switch body
; type; toggle `kas` against `fitted` inside a group to see what the
; interpretation changed. Nothing here is meant to be painted on or exported -
; it is a measuring instrument. The files are read where they live, so nothing
; is copied and nothing can be saved over by accident.
;
; A missing file is skipped in silence: Kas has no Thin_Female, no Child and no
; FurChild, and the interpretation exists only for Female, Male and Fat.
;
; Written against GIMP 3, where Script-Fu returns plain values instead of
; one-element lists. `tpc-one` keeps it working on 2.10 as well.

(define tpc-root "C:/Users/nelim/Documents/rimworld/TailoredPants")
(define tpc-wdi "C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/Things/Pawn/Humanlike/Bodies")
(define tpc-kas "C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3789119336/Mods/VisiblePants/Textures/Core/Things/Pawn/Humanlike/Apparel/Pants")
(define tpc-fitted (string-append tpc-root "/Mod/Textures/Things/TailoredPants/Apparel/Pants"))

; Every body type WDI ships, heaviest variants next to their base so the eye
; can jump between them.
(define tpc-bodies
  '("Female" "Male" "Thin" "Thin_Female" "Fat" "Fat_Female"
    "Hulk" "Hulk_Female" "Child" "FurChild"))

(define tpc-facings '("south" "north" "east"))

(define (tpc-one v) (if (pair? v) (car v) v))

(define (tpc-exists? file)
  (let ((r (file-exists? file)))
    (cond ((pair? r) (= (car r) TRUE))
          ((number? r) (= r TRUE))
          (else r))))

; Inserted at the top of the group each time, so the call order below reads
; bottom to top the way the stack does.
(define (tpc-add image group file name visible opacity)
  (if (tpc-exists? file)
      (let ((layer (tpc-one (gimp-file-load-layer RUN-NONINTERACTIVE image file))))
        (gimp-image-insert-layer image layer group 0)
        (gimp-item-set-name layer name)
        (gimp-item-set-visible layer visible)
        (gimp-layer-set-opacity layer opacity)
        layer)
      #f))

; GIMP 3 renamed the group constructor to `gimp-group-layer-new`. Its
; PDB-compat-v2.scm still defines the old name, but the Script-Fu console does
; not load that file, so the old name is simply unbound there.
(define (tpc-new-group image)
  (tpc-one (if (defined? 'gimp-group-layer-new)
               (gimp-group-layer-new image)
               (gimp-layer-group-new image))))

(define (tpc-group image body facing visible)
  (let ((group (tpc-new-group image)))
    (gimp-image-insert-layer image group 0 -1)
    (gimp-item-set-name group body)
    (tpc-add image group
             (string-append tpc-wdi "/Naked_" body "_" facing ".png")
             (string-append "body " body) TRUE 100)
    (tpc-add image group
             (string-append tpc-kas "/Pants_" body "_" facing ".png")
             (string-append "kas " body) TRUE 100)
    (tpc-add image group
             (string-append tpc-fitted "/Pants_" body "_" facing ".png")
             (string-append "fitted " body) FALSE 100)
    (gimp-item-set-visible group visible)
    group))

(define (tpc-build facing)
  (let ((image (tpc-one (gimp-image-new 512 512 RGB))))
    ; Reversed, because each group goes on top of the last: the list then reads
    ; top to bottom in the layers dialog the way it is written above.
    (for-each (lambda (body) (tpc-group image body facing FALSE))
              (reverse (cdr tpc-bodies)))
    (tpc-group image (car tpc-bodies) facing TRUE)
    image))

(define (tpc-open facing)
  (let ((image (tpc-build facing)))
    (gimp-display-new image)
    (gimp-displays-flush)
    image))

(define (tpc-open-all)
  (for-each (lambda (facing) (tpc-open facing)) tpc-facings))
