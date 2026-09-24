# The same trousers with a different mod supplying them: XeoNovaDan's Visible Pants instead of AB's.
#
# Two visible-pants mods draw different garments from the same band, so one of them looking right
# is not both. XND's pants are the ones drawn for the vanilla footprint, which is exactly the
# opposite of the body this mod exists for, and until this feature ran nothing at all was known
# about how TailorMade's band treats them.
#
# What this mod does here is meant to be nothing. Its trouser step only acts where AB is the
# supplier: with AB absent it returns before it registers a texture or makes a pattern def, so
# TailorMade fits XND's art into the band exactly as it did before this mod was installed, and the
# pants slider still applies. That is the behaviour under test, and it is stated as two things that
# can be read: the mod is quiet, and a person looks at what the band did to art it was not drawn for.
#
# Two passes play it. wdi-xnd stages XND alone. wdi-xnd-general adds General Textures Collection,
# whose LoadFolders loads its own retexture of these garments only when XND is active, so there the
# trousers are General's art, supplied by General and not by this mod, and this mod's "leave it
# alone" branch is the one that runs. The pass name is on the report and nothing in an image says
# which it is: write it down beside the images.
#
# @review is this project's own convention and Pickle does nothing with it. The captures assert
# nothing about the picture. What keeps a green from being empty is the scenario that reads
# wornGraphicPath, because XND, unlike AB, writes it from a def patch and needs no settings file.
@review @watch @timeout:90
Feature: the trousers when XeoNovaDan's Visible Pants supplies them

  Background:
    Given the save "test-colony" is loaded

  @requires:xeonovadan.visiblepants
  Scenario: XND is the one supplying the trousers in this pass
    Then mod "XeoNovaDan.VisiblePants" is loaded
    And mod "ab.vplrf" is not loaded

  # The scenario above proves XND is loaded, not that it did anything. This reads the field: vanilla
  # Apparel_Pants carries no worn graphic, so a value here can only have come from a supplier. XND
  # writes it from a patch (Common/Patches/Core/ThingDefs_Misc/Apparel_Various.xml, read on
  # 2026-09-24), under Core/..., and that is a different path from AB's Things/...: so this
  # assertion also proves this mod's AB path is not the one in play, whatever else is installed.
  @requires:xeonovadan.visiblepants
  Scenario: XND has given the trousers its own worn graphic
    Then def "Apparel_Pants" field "apparel.wornGraphicPath" is "Core/Things/Pawn/Humanlike/Apparel/Pants/Pants"

  @requires:xeonovadan.visiblepants
  Scenario: this mod stayed out of the way
    Then no warning matching "[TailorMade Waistlines]" was logged
    And no warnings from mod "TailorMade Waistlines"

  @requires:wdi.realistic.bodies @requires:xeonovadan.visiblepants
  Scenario: a colonist whose gender is male, wearing XND's trousers
    Given a colonist "Waistline" exists
    And "Waistline" gender is male
    When I destroy the gear of "Waistline"
    And I dress "Waistline" in "Apparel_Pants"
    And "Waistline" is wearing "Apparel_Pants"
    And I draft "Waistline"
    And I select "Waistline"
    And I zoom all the way in
    And I move the camera to "Waistline"
    And I wait 120 ticks
    And "Waistline" apparel covers "Legs"
    Then I take a screenshot "XND trousers, gender male, body as generated"

  @same-world @requires:wdi.realistic.bodies @requires:xeonovadan.visiblepants
  Scenario: a female colonist wearing XND's trousers
    Given a colonist "Waistline-F" exists
    And "Waistline-F" gender is female
    When I destroy the gear of "Waistline-F"
    And I dress "Waistline-F" in "Apparel_Pants"
    And "Waistline-F" is wearing "Apparel_Pants"
    And I draft "Waistline-F"
    And I select "Waistline-F"
    And I zoom all the way in
    And I move the camera to "Waistline-F"
    And I wait 120 ticks
    And "Waistline-F" apparel covers "Legs"
    Then I take a screenshot "XND trousers on a female body"

  @same-world @requires:wdi.realistic.bodies @requires:xeonovadan.visiblepants
  Scenario: the child garment under XND
    Given a colonist "Waistline-K" exists
    And "Waistline-K" is 8 years old
    When I destroy the gear of "Waistline-K"
    And I dress "Waistline-K" in "Apparel_KidPants"
    And "Waistline-K" is wearing "Apparel_KidPants"
    And I draft "Waistline-K"
    And I select "Waistline-K"
    And I zoom all the way in
    And I move the camera to "Waistline-K"
    And I wait 120 ticks
    And "Waistline-K" apparel covers "Legs"
    Then I take a screenshot "XND trousers on a child body"

  # Only in the pass that names General: with XND active its LoadFolders loads General's retexture,
  # so the supplier of the art is General, and the mod's startup step must have recognised that and
  # left it alone. Nothing here can see the texture path; the cause is asserted instead.
  @requires:xeonovadan.visiblepants @requires:kas.generalcollection
  Scenario: General is loaded beside XND, so General's art is what is drawn
    Then mod "kas.generalcollection" is loaded
    And mod "XeoNovaDan.VisiblePants" is loaded
    And mod "ab.vplrf" is not loaded
