; Builds the GIMP projects for the pants masks.
;
; In GIMP: Filters > Script-Fu > Console, then
;
;   (load "C:/Users/nelim/Documents/rimworld/TailoredPants/_tools/gimp-project.scm")
;   (tp-open "Female" "south")      ; one body type, one facing
;   (tp-open-body "Female")         ; its three facings
;   (tp-open-all)                   ; all eighteen, if you have the patience
;
; Each project has, from the bottom up:
;
;   body       the naked body texture, to trace over
;   fitted     the garment as TailorMade renders it through the current mask,
;              hidden by default
;   MASK       the mask itself, at 70% opacity so the body shows through - the
;              only layer to paint on
;
; White is where the garment may show, transparent is where it is cut. Only the
; alpha channel reaches TailorMade, so a hard white brush and the eraser are the
; whole toolset. A horizontal guide marks the waistline the generator found.
;
; Save the project with Ctrl+Shift+S, next to its images under Art/Gimp.
;
; To put an edited mask back into the mod: hide `body` and `fitted`, then
; File > Export As, straight over
;   Mod/Textures/Things/TailoredPants/<Body>/Pants_mask_<facing>.png
; `make-masks.js` then leaves that file alone, because its hash no longer
; matches what the generator wrote. `--overwrite` forces it back to generated.
;
; Written against GIMP 3, where Script-Fu returns plain values instead of
; one-element lists. `tp-one` keeps it working on 2.10 as well.

(define tp-root "C:/Users/nelim/Documents/rimworld/TailoredPants")
(define tp-bodies '("Female" "Male" "Thin" "Fat" "Hulk" "Child"))
(define tp-facings '("south" "north" "east"))

(load (string-append tp-root "/_tools/waists.scm"))

(define (tp-one v) (if (pair? v) (car v) v))

(define (tp-exists? file)
  (let ((r (file-exists? file)))
    (cond ((pair? r) (= (car r) TRUE))
          ((number? r) (= r TRUE))
          (else r))))

(define (tp-asset body facing kind)
  (string-append tp-root "/Art/Gimp/" body "/" kind "_" facing ".png"))

; The waistline row the mask generator settled on, or #f.
(define (tp-waist body facing)
  (let loop ((rows tp-waists))
    (cond ((null? rows) #f)
          ((and (string=? (car (car rows)) body)
                (string=? (cadr (car rows)) facing))
           (caddr (car rows)))
          (else (loop (cdr rows))))))

(define (tp-add-layer image file name visible opacity)
  (if (tp-exists? file)
      (let ((layer (tp-one (gimp-file-load-layer RUN-NONINTERACTIVE image file))))
        (gimp-image-insert-layer image layer 0 -1)
        (gimp-item-set-name layer name)
        (gimp-item-set-visible layer visible)
        (gimp-layer-set-opacity layer opacity)
        layer)
      #f))

(define (tp-build body facing)
  (let ((image (tp-one (gimp-image-new 512 512 RGB)))
        (waist (tp-waist body facing)))
    (tp-add-layer image (tp-asset body facing "body") "body" TRUE 100)
    (tp-add-layer image (tp-asset body facing "fitted") "fitted" FALSE 100)
    (tp-add-layer image (tp-asset body facing "mask") "MASK" TRUE 70)
    (if waist (gimp-image-add-hguide image waist))
    image))

(define (tp-open body facing)
  (let ((image (tp-build body facing)))
    (gimp-display-new image)
    (gimp-displays-flush)
    image))

(define (tp-open-body body)
  (for-each (lambda (facing)
              (if (tp-exists? (tp-asset body facing "body")) (tp-open body facing)))
            tp-facings))

(define (tp-open-all)
  (for-each (lambda (body) (tp-open-body body)) tp-bodies))
