# The trousers on the body types Pickle's own steps can reach, and nothing else.
#
# This file used to be ten scenarios (a man, a woman, thin, fat and hulking of each, a boy and a girl),
# each setting a body type on purpose and asserting the texture path the game drew. That needed two
# steps the released Pickle lacks, `{string} body type is {word}` and `{string} apparel {string} is
# drawn from {string}` (RimWorks/Rimworld-Pickle#32), so it failed on undefined steps in every pass.
# It is rewritten with the steps the released Pickle has, at a real cost, stated here so it is not
# forgotten: the ten are in git at d9e8aa0 and come back when those steps exist.
#
# What the released Pickle can do is `gender is`, `is N years old`, `has backstory`, and colonists
# that already exist. None of them sets a body type: a gender or an age leaves it alone (the trap 01
# found), and a backstory is not read again after generation. So the body types available are the
# ones the fixture's own colonists have. Pickle's test-colony.rws holds three humans:
#
#   Jet, Morrison   female, body type Female
#   Larson          male, body type Thin
#
# and that gives two silhouettes that are what they say (a Female body, a Thin one) and a third that
# is a Thin body under a woman's gender, which is the same texture (the game picks the trousers by
# body type, not by gender). Not reachable, and NOT covered by anything in this suite: a Male body,
# Fat, Hulk and the child body. Read "the trousers were checked on every body type" as false.
#
# The assertion that went with the ten, the texture path actually drawn, is not reachable either. What
# stays is the one thing a missing texture leaves behind: the game logs a warning when it asks for a
# trouser texture that does not exist, so a body type with no trousers for it would show there. That is
# an absence of a warning, weaker than the path, and it says nothing about how the trousers read.
#
# No AB tag here, unlike the ten: any pass with a legless body retexture (WDI) and a supplier of
# trousers has something to photograph, so the two XND passes run these as well. The bare pass skips
# them. Whichever mod supplied the trousers is written in the report's set name, not in the image.
#
# The order in each scenario matters for the same reason as in 01: dress first, then draft, or the
# pawn takes no job and wears nothing; "is wearing" is the barrier that fails when it never does.
@review @watch @silhouettes @timeout:120
Feature: the trousers on the body types the released Pickle can reach

  Background:
    Given the save "test-colony" is loaded

  @requires:wdi.realistic.bodies
  Scenario: a woman with the Female body
    Given a colonist "Jet" exists
    When I destroy the gear of "Jet"
    And I dress "Jet" in "Apparel_Pants"
    And "Jet" is wearing "Apparel_Pants"
    And I draft "Jet"
    And I select "Jet"
    And I zoom all the way in
    And I move the camera to "Jet"
    And I wait 120 ticks
    And "Jet" apparel covers "Legs"
    Then no warning matching "Could not load UnityEngine.Texture2D" was logged
    And I take a screenshot "silhouette, woman, Female"

  # Larson is a man as the fixture has him, with the Thin body he was generated with.
  @same-world @requires:wdi.realistic.bodies
  Scenario: a thin man
    Given a colonist "Larson" exists
    And "Larson" gender is male
    When I destroy the gear of "Larson"
    And I dress "Larson" in "Apparel_Pants"
    And "Larson" is wearing "Apparel_Pants"
    And I draft "Larson"
    And I select "Larson"
    And I zoom all the way in
    And I move the camera to "Larson"
    And I wait 120 ticks
    And "Larson" apparel covers "Legs"
    Then no warning matching "Could not load UnityEngine.Texture2D" was logged
    And I take a screenshot "silhouette, man, Thin"

  # The same Thin body with the gender set to female: the gender step leaves the body type alone, so
  # this is the Thin texture again and not a different one. It is here because a woman with a Thin
  # body is a silhouette players have, and to show the gender changes nothing about which trousers.
  @same-world @requires:wdi.realistic.bodies
  Scenario: a thin woman
    Given a colonist "Larson" exists
    And "Larson" gender is female
    When I destroy the gear of "Larson"
    And I dress "Larson" in "Apparel_Pants"
    And "Larson" is wearing "Apparel_Pants"
    And I draft "Larson"
    And I select "Larson"
    And I zoom all the way in
    And I move the camera to "Larson"
    And I wait 120 ticks
    And "Larson" apparel covers "Legs"
    Then no warning matching "Could not load UnityEngine.Texture2D" was logged
    And I take a screenshot "silhouette, woman, Thin"
