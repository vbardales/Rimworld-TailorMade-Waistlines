# Legwear that is not trousers (not a gallery feature): shorts and a skirt from Vanilla Apparel Expanded, on the four adult body types, both sexes,
# a dyed t-shirt on top. What is read in the captures: with shorts the legs below the hem are the bare body, with no black wedge
# painted by this mod (it only draws for Pants); with a skirt the fabric is one solid shape, no gap between two legs.
# Pass: wsl-deps.legwear.map. Every image is opened and read.
@review @legwear @timeout:300
Feature: shorts and skirts

  Background:
    Given the save "Nelims-tribe" is loaded

  @requires:wdi.realistic.bodies @requires:ab.vplrf @requires:VanillaExpanded.VAPPE @requires:nelim.pickletools.screenshotstudio @requires:nelim.pickletools.colonistrace
  Scenario: shorts, then a skirt, on eight bodies
    Given Nelim's Pickle Tools: the animals are removed from the sanctuary "calm-zone-close"
    And Nelim's Pickle Tools: the other colonists are out of frame
    And a colonist "M-Thin" exists
    And "M-Thin" gender is male
    And Nelim's Pickle Tools: "M-Thin" body type is Thin
    And a colonist "M-Avg" exists
    And "M-Avg" gender is male
    And Nelim's Pickle Tools: "M-Avg" body type is Male
    And a colonist "M-Fat" exists
    And "M-Fat" gender is male
    And Nelim's Pickle Tools: "M-Fat" body type is Fat
    And a colonist "M-Hulk" exists
    And "M-Hulk" gender is male
    And Nelim's Pickle Tools: "M-Hulk" body type is Hulk
    And a colonist "F-Thin" exists
    And "F-Thin" gender is female
    And Nelim's Pickle Tools: "F-Thin" body type is Thin
    And a colonist "F-Avg" exists
    And "F-Avg" gender is female
    And Nelim's Pickle Tools: "F-Avg" body type is Female
    And a colonist "F-Fat" exists
    And "F-Fat" gender is female
    And Nelim's Pickle Tools: "F-Fat" body type is Fat
    And a colonist "F-Hulk" exists
    And "F-Hulk" gender is female
    And Nelim's Pickle Tools: "F-Hulk" body type is Hulk
    And Nelim's Pickle Tools: "M-Thin" stands at (196, 186) facing South
    And I draft "M-Thin"
    And Nelim's Pickle Tools: "M-Avg" stands at (198, 186) facing South
    And I draft "M-Avg"
    And Nelim's Pickle Tools: "M-Fat" stands at (200, 186) facing South
    And I draft "M-Fat"
    And Nelim's Pickle Tools: "M-Hulk" stands at (202, 186) facing South
    And I draft "M-Hulk"
    And Nelim's Pickle Tools: "F-Thin" stands at (196, 184) facing South
    And I draft "F-Thin"
    And Nelim's Pickle Tools: "F-Avg" stands at (198, 184) facing South
    And I draft "F-Avg"
    And Nelim's Pickle Tools: "F-Fat" stands at (200, 184) facing South
    And I draft "F-Fat"
    And Nelim's Pickle Tools: "F-Hulk" stands at (202, 184) facing South
    And I draft "F-Hulk"
    When I destroy the gear of "M-Thin"
    And Nelim's Pickle Tools: "M-Thin" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "M-Thin" wears "VAE_Apparel_Shorts" dyed rgb (46, 74, 120)
    And I destroy the gear of "M-Avg"
    And Nelim's Pickle Tools: "M-Avg" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "M-Avg" wears "VAE_Apparel_Shorts" dyed rgb (46, 74, 120)
    And I destroy the gear of "M-Fat"
    And Nelim's Pickle Tools: "M-Fat" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "M-Fat" wears "VAE_Apparel_Shorts" dyed rgb (46, 74, 120)
    And I destroy the gear of "M-Hulk"
    And Nelim's Pickle Tools: "M-Hulk" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "M-Hulk" wears "VAE_Apparel_Shorts" dyed rgb (46, 74, 120)
    And I destroy the gear of "F-Thin"
    And Nelim's Pickle Tools: "F-Thin" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "F-Thin" wears "VAE_Apparel_Shorts" dyed rgb (46, 74, 120)
    And I destroy the gear of "F-Avg"
    And Nelim's Pickle Tools: "F-Avg" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "F-Avg" wears "VAE_Apparel_Shorts" dyed rgb (46, 74, 120)
    And I destroy the gear of "F-Fat"
    And Nelim's Pickle Tools: "F-Fat" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "F-Fat" wears "VAE_Apparel_Shorts" dyed rgb (46, 74, 120)
    And I destroy the gear of "F-Hulk"
    And Nelim's Pickle Tools: "F-Hulk" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "F-Hulk" wears "VAE_Apparel_Shorts" dyed rgb (46, 74, 120)
    And Nelim's Pickle Tools: I am at the sanctuary "calm-zone-close"
    And Nelim's Pickle Tools: studio presentation mode is enabled
    And I wait 90 ticks
    And "M-Thin" apparel covers "Legs"
    And "M-Avg" apparel covers "Legs"
    And "M-Fat" apparel covers "Legs"
    And "M-Hulk" apparel covers "Legs"
    And "F-Thin" apparel covers "Legs"
    And "F-Avg" apparel covers "Legs"
    And "F-Fat" apparel covers "Legs"
    And "F-Hulk" apparel covers "Legs"
    And I take a screenshot "legwear, shorts, eight bodies"
    And I destroy the gear of "M-Thin"
    And Nelim's Pickle Tools: "M-Thin" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "M-Thin" wears "VAE_Apparel_Skirt" dyed rgb (46, 74, 120)
    And I destroy the gear of "M-Avg"
    And Nelim's Pickle Tools: "M-Avg" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "M-Avg" wears "VAE_Apparel_Skirt" dyed rgb (46, 74, 120)
    And I destroy the gear of "M-Fat"
    And Nelim's Pickle Tools: "M-Fat" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "M-Fat" wears "VAE_Apparel_Skirt" dyed rgb (46, 74, 120)
    And I destroy the gear of "M-Hulk"
    And Nelim's Pickle Tools: "M-Hulk" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "M-Hulk" wears "VAE_Apparel_Skirt" dyed rgb (46, 74, 120)
    And I destroy the gear of "F-Thin"
    And Nelim's Pickle Tools: "F-Thin" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "F-Thin" wears "VAE_Apparel_Skirt" dyed rgb (46, 74, 120)
    And I destroy the gear of "F-Avg"
    And Nelim's Pickle Tools: "F-Avg" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "F-Avg" wears "VAE_Apparel_Skirt" dyed rgb (46, 74, 120)
    And I destroy the gear of "F-Fat"
    And Nelim's Pickle Tools: "F-Fat" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "F-Fat" wears "VAE_Apparel_Skirt" dyed rgb (46, 74, 120)
    And I destroy the gear of "F-Hulk"
    And Nelim's Pickle Tools: "F-Hulk" wears "Apparel_BasicShirt" dyed rgb (230, 224, 206)
    And Nelim's Pickle Tools: "F-Hulk" wears "VAE_Apparel_Skirt" dyed rgb (46, 74, 120)
    And Nelim's Pickle Tools: I am at the sanctuary "calm-zone-close"
    And I wait 90 ticks
    And "M-Thin" apparel covers "Legs"
    And "M-Avg" apparel covers "Legs"
    And "M-Fat" apparel covers "Legs"
    And "M-Hulk" apparel covers "Legs"
    And "F-Thin" apparel covers "Legs"
    And "F-Avg" apparel covers "Legs"
    And "F-Fat" apparel covers "Legs"
    And "F-Hulk" apparel covers "Legs"
    And I take a screenshot "legwear, skirt, eight bodies"
    Then no warning matching "Could not load UnityEngine.Texture2D" was logged
    And no warning matching "Failed to find any textures" was logged
