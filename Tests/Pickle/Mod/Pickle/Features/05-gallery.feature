# Gallery photographs (PUBLISHING.md: staged, not default settings; PUBLICATION.md has the plan and the reasons).
# Story: the fitting. One pair of trousers, five bodies, on the bare ground of the Sanctuaire's calm-zone at midday.
# Place chosen from the empty photographs of every place; the images of the run are read one by one before any goes to Art/Gallery.
# Pass: wsl-deps.gallery.map. Not part of the regression passes: it is skipped anywhere the Sanctuaire is not mounted.
@review @gallery @timeout:180
Feature: the fitting, for the gallery

  Background:
    Given the save "Nelims-tribe" is loaded

  @requires:wdi.realistic.bodies @requires:ab.vplrf @requires:nelim.pickletools.screenshotstudio @requires:nelim.pickletools.colonistrace
  Scenario: five bodies, one pair of trousers
    Given Nelim's Pickle Tools: the animals are removed from the sanctuary "calm-zone-close"
    And Nelim's Pickle Tools: the other colonists are out of frame
    And a colonist "Thin" exists
    And Nelim's Pickle Tools: "Thin" body type is Thin
    And a colonist "Male" exists
    And Nelim's Pickle Tools: "Male" body type is Male
    And a colonist "Female" exists
    And Nelim's Pickle Tools: "Female" body type is Female
    And a colonist "Fat" exists
    And Nelim's Pickle Tools: "Fat" body type is Fat
    And a colonist "Hulk" exists
    And Nelim's Pickle Tools: "Hulk" body type is Hulk
    When I destroy the gear of "Thin"
    And I destroy the gear of "Male"
    And I destroy the gear of "Female"
    And I destroy the gear of "Fat"
    And I destroy the gear of "Hulk"
    And Nelim's Pickle Tools: "Thin" wears "Apparel_Pants" dyed rgb (46, 74, 120)
    And Nelim's Pickle Tools: "Male" wears "Apparel_Pants" dyed rgb (46, 74, 120)
    And Nelim's Pickle Tools: "Female" wears "Apparel_Pants" dyed rgb (46, 74, 120)
    And Nelim's Pickle Tools: "Fat" wears "Apparel_Pants" dyed rgb (46, 74, 120)
    And Nelim's Pickle Tools: "Hulk" wears "Apparel_Pants" dyed rgb (46, 74, 120)
    And Nelim's Pickle Tools: "Thin" stands at (196, 185) facing South
    And Nelim's Pickle Tools: "Male" stands at (198, 185) facing South
    And Nelim's Pickle Tools: "Female" stands at (200, 185) facing South
    And Nelim's Pickle Tools: "Fat" stands at (202, 185) facing South
    And Nelim's Pickle Tools: "Hulk" stands at (204, 185) facing South
    And Nelim's Pickle Tools: I am at the sanctuary "calm-zone-close"
    And Nelim's Pickle Tools: studio presentation mode is enabled
    And I wait 120 ticks
    Then "Thin" apparel covers "Legs"
    And "Hulk" apparel covers "Legs"
    And no warning matching "Could not load UnityEngine.Texture2D" was logged
    And I take a screenshot "gallery, the fitting, five bodies"
