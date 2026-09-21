# TESTING.md scenario 6, and the question the mod turns on: does a garment banded into a body
# drawn without legs still read as that garment?
#
# Nothing here asserts. TailorMade scales a garment into its band rather than cropping it, so
# whether a waistband survives that is a judgement about an image, and no assertion states it.
# What the suite buys is that the judgement is made on the same pawn, at the same zoom, after
# every change - which is the only thing that makes two captures comparable.
#
# Every step below is a Pickle vanilla step. This suite ships no assembly of its own: a step we
# would have written is a step to maintain, and nothing here needs one.
#
# That has a cost, and it is the one thing to know before reading a report. Nothing in these images
# says which fitting produced them. While Mod/Defs/TailorPatternDefs/Pants_Native.xml is in place
# it makes TailorMade ignore both garments dressed below outright - no bake, no band - so these are
# captures of AB's art drawn as the game draws it, not of the mod. With that file absent they are captures of the band. The two
# are indistinguishable in the picture, so write down which run produced a report when you copy it
# out - the archive keeps only the last five, and after that nothing can tell you.
#
# "a colonist {string} exists" generates the pawn seeded from the scenario, so a rerun spawns the
# same one. "I strip" leaves the body bare, which is what isolates the trousers: anything else
# worn would cover the band under test.
#
# Two things the first run (2026-09-20, 3 scenarios green, three worthless images) taught, both
# guarded below rather than described:
#
# "I dress" queues a wear job, it does not put the garment on. The first run captured a pawn
# CARRYING its trousers to a stockpile, and nothing failed, because nothing asserted. "is wearing"
# is the barrier: it holds until the garment is worn and fails loudly if it never is.
#
# And under @same-world the strip of one scenario leaves clothes on the ground for the next pawn to
# haul. That is a cost of sharing the world, not a reason to stop: rebuilding it three times costs
# far more. The barrier above is what keeps it from reaching the image.
@review
Feature: how trousers read on a body drawn without legs

  # A fixture, not a quickstart: "the save {string} is loaded" is a Pickle step and reads from any
  # active mod's Pickle/Fixtures/, and Pickle ships test-colony.rws itself, so nothing has to be
  # staged or declared for it. A quickstart would regenerate the world every run; a fixture loads
  # in seconds, and three captures do not need a world of their own.
  Background:
    Given the save "test-colony" is loaded

  Scenario: a male colonist wearing nothing but trousers
    Given a colonist "Waistline" exists
    And "Waistline" gender is male
    When I strip "Waistline"
    And I dress "Waistline" in "Apparel_Pants"
    And "Waistline" is wearing "Apparel_Pants"
    And I select "Waistline"
    And I move the camera to "Waistline"
    And I wait 60 ticks
    And I zoom all the way in
    And I wait 30 ticks
    Then I take a screenshot "trousers on a male body"

  @same-world
  Scenario: a female colonist wearing nothing but trousers
    Given a colonist "Waistline-F" exists
    And "Waistline-F" gender is female
    When I strip "Waistline-F"
    And I dress "Waistline-F" in "Apparel_Pants"
    And "Waistline-F" is wearing "Apparel_Pants"
    And I select "Waistline-F"
    And I move the camera to "Waistline-F"
    And I wait 60 ticks
    And I zoom all the way in
    And I wait 30 ticks
    Then I take a screenshot "trousers on a female body"

  # Biotech children wear their own garment. It is a separate ThingDef with a wornGraphicPath of
  # its own, so it can be drawn bare however well the adult trousers came out.
  @same-world
  Scenario: the child garment, which is a different def
    Given a colonist "Waistline-K" exists
    And "Waistline-K" is 8 years old
    When I strip "Waistline-K"
    And I dress "Waistline-K" in "Apparel_KidPants"
    And "Waistline-K" is wearing "Apparel_KidPants"
    And I select "Waistline-K"
    And I move the camera to "Waistline-K"
    And I wait 60 ticks
    And I zoom all the way in
    And I wait 30 ticks
    Then I take a screenshot "trousers on a child body"
