# TESTING.md scenario 6, and the question the mod turns on: does a garment banded into a body
# drawn without legs still read as that garment?
#
# Nothing here asserts. TailorMade scales a garment into its band rather than cropping it, so
# whether a waistband survives that is a judgement about an image, and no assertion states it.
# What the suite buys is that the judgement is made on the same pawn, at the same zoom, after
# every change - which is the only thing that makes two captures comparable.
#
# Every step below is a Pickle vanilla step. This suite ships no assembly of its own on purpose:
# a step we would have written is a step to maintain, and nothing here needs one. The one exception
# is "the fitting that claims ... is recorded", from the suite's own assembly: it attaches which
# pattern actually resolved for the garment, so a capture says on its own face whether the band or
# a TailorPatternDef produced it. Without it the only thing telling two runs apart is which run
# produced them, and the report archive keeps only the last five.
#
# "a colonist {string} exists" generates the pawn seeded from the scenario, so a rerun spawns the
# same one. "I strip" leaves the body bare, which is what isolates the trousers: anything else
# worn would cover the band under test.
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
    And I select "Waistline"
    And I move the camera to "Waistline"
    And I zoom all the way in
    And I wait 60 ticks
    And the fitting that claims "Apparel_Pants" is recorded
    Then I take a screenshot "trousers on a male body"

  @same-world
  Scenario: a female colonist wearing nothing but trousers
    Given a colonist "Waistline-F" exists
    And "Waistline-F" gender is female
    When I strip "Waistline-F"
    And I dress "Waistline-F" in "Apparel_Pants"
    And I select "Waistline-F"
    And I move the camera to "Waistline-F"
    And I zoom all the way in
    And I wait 60 ticks
    And the fitting that claims "Apparel_Pants" is recorded
    Then I take a screenshot "trousers on a female body"

  # Biotech children wear their own garment. It is a separate ThingDef with a wornGraphicPath of
  # its own, so it can be drawn bare however well the adult trousers came out.
  @same-world
  Scenario: the child garment, which is a different def
    Given a colonist "Waistline-K" exists
    And "Waistline-K" is 8 years old
    When I strip "Waistline-K"
    And I dress "Waistline-K" in "Apparel_KidPants"
    And I select "Waistline-K"
    And I move the camera to "Waistline-K"
    And I zoom all the way in
    And I wait 60 ticks
    And the fitting that claims "Apparel_KidPants" is recorded
    Then I take a screenshot "trousers on a child body"
