# Scenario 3 of TESTING.md: the pawns already on the map repaint without a reload.
#
# This is the one behaviour of the mod that is neither a decision nor a number. Closing the
# settings window calls TailorMade.TailorMadeCache.ClearAndRepaint(), and what it has to achieve
# is that every texture baked against the old band is gone and the pawns are drawn again. A unit
# test can watch the band change; only a game with pawns in it has textures to throw away.
#
# TexBake.Stats() is TailorMade's own count of fitted textures, which is what makes the sweep
# observable at all: it goes down when the cache is emptied and up again as pawns redraw.
#
# The fitting is recorded first, and that line is the scenario's own label: a TailorPatternDef
# with autoFit false bypasses the band for the garment it claims, and a run made with such a def
# in place would show a sweep that changes nothing on those pawns. Better to have the report say
# so than to have someone read the images as a verdict on the band.
Feature: moving a band sweeps the fitted textures and repaints the map

  Scenario: the pants band moves and the map follows
    Given the save "test-colony" is loaded
    When I close all dialogs
    Then the band decides the fit of "Apparel_Pants"
    When I let TailorMade bake what the map draws
    And I move the pants band to 0.42 and close the settings window
    Then TailorMade's fitted textures were swept
    And the pawns on the map are drawn again
    And the mod logged no error since startup

  # The child garment is a def of its own with its own worn graphic, so it is reached by the same
  # band and has to be looked at separately - whatever supplies the art has to cover it too.
  Scenario: the child garment is reached by the same band
    Given the save "test-colony" is loaded
    Then the band decides the fit of "Apparel_KidPants"
    And the fitting that claims "Apparel_Pants" is recorded
