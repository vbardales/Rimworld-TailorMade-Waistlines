# One photograph asked for by A Certain Series (Creatures and Hair Renew): its hairstyle ACS_misaka on a Female pawn, on WDI's body,
# in the clothes this mod fits (cream t-shirt, deep brown trousers). Story: a student who has just come home at noon, the cat has found
# its place; the white hairclips are what the picture is about.
# Place: the Sanctuaire's sofa-corner, the pawn at (187, 123) facing South, camera on (188, 123). Noon, a few minutes after the start.
# Shot plan: place sofa-corner; moment 12:00 + about 5 minutes; subject Female pawn, white hair so the texture shows its own colours,
# cream blouse #F1E7D0 over brown trousers #5A3B28; framing close on the pawn, sofas and rose rug behind; the cat two cells beside her.
# Pass: wsl-deps.acs.map.
@review @acs @timeout:300
Feature: a student home at noon, for A Certain Series

  Background:
    Given the save "Nelims-tribe" is loaded

  @requires:wdi.realistic.bodies @requires:ab.vplrf @requires:nelim.pickletools.screenshotstudio @requires:nelim.pickletools.colonistrace @requires:nelim.acertainseriescreaturesandhair
  Scenario: misaka at the sofa corner
    Given I set the hour to 12
    And a colonist "Misaka" exists
    And "Misaka" gender is female
    And Nelim's Pickle Tools: "Misaka" body type is Female
    And Nelim's Pickle Tools: "Misaka" hairstyle is "ACS_misaka"
    And Nelim's Pickle Tools: "Misaka" hair colour is rgb (255, 255, 255)
    And Nelim's Pickle Tools: "Misaka" stands at (187, 123) facing South
    And I draft "Misaka"
    And I destroy the gear of "Misaka"
    And Nelim's Pickle Tools: "Misaka" wears "Apparel_BasicShirt" dyed rgb (241, 231, 208)
    And Nelim's Pickle Tools: "Misaka" wears "Apparel_Pants" dyed rgb (90, 59, 40)
    And Nelim's Pickle Tools: the other colonists are out of frame
    When Nelim's Pickle Tools: I am at the sanctuary "sofa-corner"
    And Nelim's Pickle Tools: I frame the cell (188, 123) at zoom 11
    And Nelim's Pickle Tools: studio presentation mode is enabled
    And I wait 300 ticks
    And Nelim's Pickle Tools: an adult animal of kind "Cat" named "Mimi" is spawned at (190, 123)
    And I wait 60 ticks
    And I take a screenshot "acs, misaka at the sofa corner"
