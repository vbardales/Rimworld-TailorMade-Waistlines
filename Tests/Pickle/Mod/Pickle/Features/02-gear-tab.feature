# The pawn's own Gear tab, read after the garment is on.
#
# 01-trousers-review.feature photographs the map view and found something that does not add up:
# "apparel covers Legs" passes just before the shot, and the image shows a body with nothing on it.
# Two readings fit. Either the pawn wears the trousers and the renderer draws nothing, or that
# assertion is passing on something other than what it looks like. The Gear tab is the game's own
# list of what a pawn has on, so a screenshot of it is a second witness that does not depend on how
# anything is drawn.
#
# It needs a Pickle carrying the inspect-tab steps, RimWorks/Rimworld-Pickle#31. They are not in
# the Workshop copy at the time of writing, so a run that stages the Workshop Pickle fails on an
# undefined step. That is why this is a file of its own: 01 keeps working against either. Until
# the PR merges, stage a build of its branch with `Run-PickleWsl.ps1 -PickleSrc <folder>`.
#
# The second shot of each scenario is the Bio tab, and it is named by its type,
# ITab_Pawn_Character: the PR notes that "Bio" alone does not match. That tab draws the pawn as a
# portrait, larger than the map sprite. Whether the portrait reaches the legs is not known, so it
# is a bonus and not the evidence - the Gear tab is the evidence.
#
# No @requires here, on purpose. What the pawn has on does not depend on any body retexture, so this
# is meaningful in the bare pass too, and there it is the more useful of the two: nothing is drawn,
# and the list is the only thing that says the trousers are there.
@review @watch @timeout:90
Feature: what the Gear tab says a pawn is wearing

  Background:
    Given the save "test-colony" is loaded

  Scenario: the male colonist's Gear tab lists the trousers
    Given a colonist "Waistline" exists
    And "Waistline" gender is male
    When I destroy the gear of "Waistline"
    And I dress "Waistline" in "Apparel_Pants"
    And "Waistline" is wearing "Apparel_Pants"
    And I draft "Waistline"
    And I select "Waistline"
    And I open the "Gear" inspect tab
    Then the "Gear" inspect tab is open
    And I wait 30 ticks
    And I take a screenshot "gear tab, male colonist in trousers"
    When I open the "ITab_Pawn_Character" inspect tab
    Then the "ITab_Pawn_Character" inspect tab is open
    And I wait 30 ticks
    And I take a screenshot "character tab, male colonist in trousers"

  @same-world
  Scenario: the female colonist's Gear tab lists the trousers
    Given a colonist "Waistline-F" exists
    And "Waistline-F" gender is female
    When I destroy the gear of "Waistline-F"
    And I dress "Waistline-F" in "Apparel_Pants"
    And "Waistline-F" is wearing "Apparel_Pants"
    And I draft "Waistline-F"
    And I select "Waistline-F"
    And I open the "Gear" inspect tab
    Then the "Gear" inspect tab is open
    And I wait 30 ticks
    And I take a screenshot "gear tab, female colonist in trousers"
    When I open the "ITab_Pawn_Character" inspect tab
    Then the "ITab_Pawn_Character" inspect tab is open
    And I wait 30 ticks
    And I take a screenshot "character tab, female colonist in trousers"

  # Apparel_KidPants is a separate ThingDef with a wornGraphicPath of its own, so the child can be
  # bare while the adults are dressed, or the other way round.
  @same-world
  Scenario: the child's Gear tab lists the child garment
    Given a colonist "Waistline-K" exists
    And "Waistline-K" is 8 years old
    When I destroy the gear of "Waistline-K"
    And I dress "Waistline-K" in "Apparel_KidPants"
    And "Waistline-K" is wearing "Apparel_KidPants"
    And I draft "Waistline-K"
    And I select "Waistline-K"
    And I open the "Gear" inspect tab
    Then the "Gear" inspect tab is open
    And I wait 30 ticks
    And I take a screenshot "gear tab, child colonist in trousers"
    When I open the "ITab_Pawn_Character" inspect tab
    Then the "ITab_Pawn_Character" inspect tab is open
    And I wait 30 ticks
    And I take a screenshot "character tab, child colonist in trousers"
