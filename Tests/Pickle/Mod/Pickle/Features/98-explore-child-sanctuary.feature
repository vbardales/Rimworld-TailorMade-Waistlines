# Throwaway exploration, not part of the suite (delete after reading once): is the oversized pale-blue shape behind the child a
# garment lying on the ground under him, and not a worn graphic? Same boy as 03, but on the bare ground of the Sanctuaire with
# a cleared area under him, and framed close with PickleTools' camera step.
@explore @timeout:120
Feature: child on cleared ground

  Background:
    Given the save "Nelims-tribe" is loaded

  @requires:wdi.realistic.bodies @requires:ab.vplrf @requires:nelim.pickletools.screenshotstudio @requires:nelim.pickletools.colonistrace
  Scenario: boy on cleared ground
    Given Nelim's Pickle Tools: the other colonists are out of frame
    And a colonist "S-Boy" exists
    And "S-Boy" is 8 years old
    And "S-Boy" gender is male
    And Nelim's Pickle Tools: "S-Boy" body type is Child
    When I destroy the gear of "S-Boy"
    And I dress "S-Boy" in "Apparel_KidPants"
    And "S-Boy" is wearing "Apparel_KidPants"
    And Nelim's Pickle Tools: "S-Boy" stands at (200, 185) facing South
    And Nelim's Pickle Tools: the area from (197, 182) to (203, 188) is cleared
    And Nelim's Pickle Tools: I am at the sanctuary "calm-zone-close"
    And Nelim's Pickle Tools: I frame the cell (200, 185) at zoom 3
    And Nelim's Pickle Tools: I move the mouse to (10, 10)
    And I wait 120 ticks
    Then Nelim's Pickle Tools: "S-Boy" has body type Child
    And I take a screenshot "explore, boy on cleared ground"
