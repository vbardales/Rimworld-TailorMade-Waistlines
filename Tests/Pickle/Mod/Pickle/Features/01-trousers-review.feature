# TESTING.md scenario 6, and the question the mod turns on: does a garment banded into a body
# drawn without legs still read as that garment?
#
# The goal these scenarios are built for, stated 2026-09-21: one capture, on at least one pawn,
# showing trousers that are WORN and read as trousers rather than as a shell. Everything below is
# arranged around not losing that to an accident.
#
# Nothing here asserts about the image. Whether a waistband survives is a judgement about a
# picture, and no assertion states it. What the suite buys is that the judgement is made on the
# same pawns, framed the same way, after every change.
#
# Every step is a Pickle vanilla step; this suite ships no assembly.
#
# READ THIS BEFORE TRUSTING A CAPTURE. On a profile with no settings file for AB's Visible Pants,
# which is what the headless game has, AB gives no garment a worn graphic and the pawn is drawn
# with nothing on it - not hidden behind the body, not badly fitted, simply not drawn. Every
# capture taken that way says nothing about this mod. The last scenario of this file asserts the
# precondition (the def field AB should have filled) so that the pass goes red instead of green and
# empty. Nothing in an image says which fitting produced it either: for every body type this mod
# supplied art for, it makes TailorMade ignore both garments outright (TrouserArt), and a scenario
# below asserts that. Write down which run produced a report when you copy it out: the archive
# keeps only five.
#
# Three things the first run (2026-09-20, three green scenarios and three worthless images) taught,
# each guarded below rather than described:
#
# "I dress" queues a wear job, it does not put the garment on. That run captured a pawn CARRYING
# its trousers to a stockpile and nothing failed, because nothing asserted. "is wearing" is the
# barrier: it holds until the garment is on and fails loudly if it never gets there.
#
# A pawn left undrafted keeps working. The second capture caught one hauling somebody else's shirt
# across the map. Drafting freezes it in place - but only AFTER it is dressed, because a drafted
# pawn takes no jobs and would never put the trousers on at all.
#
# The camera. The first run showed a map about forty cells across with the pawn roughly fifty
# pixels tall, and that was taken for a zoom that had not landed. It is almost certainly the
# closest zoom vanilla allows: forty cells over 1920 pixels is about 49 pixels a cell, which is what
# a 1080-line view gives at RimWorld's minimum camera size. Asking for the closest view again
# changes nothing. A bigger pawn needs a bigger frame, not a closer camera, because the screenshot
# is the size of the virtual display. That constant is remembered, not measured: treat it as the
# working explanation until a larger frame confirms it.
#
# Ticks. Under @watch a wait in ticks passes at the game's real speed, and a step's default timeout
# is five seconds. The headless display does not always hold sixty ticks a second, so 120 ticks
# fits in five seconds on one run and not on the next: the same scenarios passed at 10:26 and
# died later with "Step 'And I wait 120 ticks' timed out after 5s". @timeout gives the waits room.
# The first explanation, that the fixture loads paused, was wrong: the capture from the run that
# passed shows the normal-speed button lit.
@review @watch @timeout:90
Feature: how trousers read on a body drawn without legs

  # A fixture, not a quickstart: "the save {string} is loaded" is a Pickle step that reads from any
  # active mod's Pickle/Fixtures/, and Pickle ships test-colony.rws itself, so nothing has to be
  # staged or declared for it. A quickstart would regenerate the world every run; a fixture loads
  # in seconds, and three captures do not need a world of their own.
  Background:
    Given the save "test-colony" is loaded

  @requires:wdi.realistic.bodies @requires:ab.vplrf
  Scenario: a male colonist wearing nothing but trousers
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
    Then I take a screenshot "trousers on a male body"

  @same-world @requires:wdi.realistic.bodies @requires:ab.vplrf
  Scenario: a female colonist wearing nothing but trousers
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
    Then I take a screenshot "trousers on a female body"

  # Biotech children wear their own garment. It is a separate ThingDef with a wornGraphicPath of
  # its own, so it can be drawn bare however well the adult trousers came out - and AB's art for it
  # sits at v 0.27..0.43 of its texture where the adult one sits at 0.16..0.30, a different shape
  # on a different body.
  @same-world @requires:wdi.realistic.bodies @requires:ab.vplrf
  Scenario: the child garment, which is a different def
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
    Then I take a screenshot "trousers on a child body"

  # The pass without the optional mods, which is the one the three above cannot make. With no body
  # retexture and nothing filling wornGraphicPath, a capture would show a pawn with no trousers
  # drawn - correct vanilla behaviour, and indistinguishable from every way this could fail. So
  # this scenario photographs nothing and asserts the one thing that holds either way: banding a
  # garment on an ordinary legged body is quiet. It carries no @requires, so it is what runs when
  # the three above skip.
  @same-world
  Scenario: the mod is quiet on a body drawn the ordinary way
    Given a colonist "Waistline-V" exists
    When I destroy the gear of "Waistline-V"
    And I dress "Waistline-V" in "Apparel_Pants"
    And "Waistline-V" apparel covers "Legs"
    Then no warnings from mod "TailorMade Waistlines"
    # The step above only sees what RimLogging could attribute to this mod. A warning raised by
    # vanilla code that our patch led into is attributed to nobody, so the class that actually
    # matters here - a garment whose texture cannot be resolved - is asserted by its text instead.
    And no warning matching "Could not load UnityEngine.Texture2D" was logged

  # What the captures above are captures OF, stated rather than remembered.
  #
  # Which mod supplies the trousers decides what the images show, and it changes silently. General
  # Textures Collection carries a retexture of these very garments under Mods/VisiblePants/, but
  # its LoadFolders gates the folder on IfModActive="XeoNovaDan.VisiblePants". With AB's Visible
  # Pants active instead, that folder never loads and the art on the pawn is AB's own - drawn for
  # bodies with legs. The same suite run against XND would photograph different trousers and look
  # just as green.
  #
  # This asserts the cause rather than the effect, because the effect is a texture path and no
  # vanilla step can read one. It is the line to change when a pass swaps suppliers.
  @requires:ab.vplrf
  Scenario: AB is the one supplying the trousers in this pass
    Then mod "ab.vplrf" is loaded
    And mod "XeoNovaDan.VisiblePants" is not loaded

  # The scenario above proves AB is loaded. It does not prove AB did anything, and on a profile
  # without AB's settings file it does nothing at all.
  #
  # AB keeps its categories in a list that starts empty. The five defaults are created only when its
  # settings file is read, or when someone presses Reset in its options window (decompiled from the
  # installed 1.6 assembly, 2026-09-21). The headless game has no such file, so AB never gives
  # any garment a wornGraphicPath, vanilla Apparel_Pants has none of its own, and every capture in
  # this feature shows a pawn with nothing drawn on it. That was found the slow way, by reading
  # images, after several wrong explanations. This is the assertion that would have found it in
  # one run: it reads the def field itself, and fails while the pass is not actually a pass.
  #
  # A red result here means the pass is invalid, not that the mod is broken: seed AB's settings
  # file into the profile before this pass, do not edit the expectation.
  @requires:ab.vplrf
  Scenario: AB has actually given the trousers a worn graphic
    Then def "Apparel_Pants" field "apparel.wornGraphicPath" is "Things/Pawn/Humanlike/Apparel/Pants/Pants"

  # This mod's own step at startup - reading General Textures Collection's trousers and drawing
  # details onto the shells General has nothing for - can fail without anything looking wrong: the
  # trousers are then simply the plain shell they always were. Every warning it logs starts with
  # "[TailorMade Waistlines]", and it logs one for the case that can be recognised as wrong, General
  # being active with its textures in place and none of them used. Matching by text, because a
  # warning from code the step led into is attributed to nobody and "no warnings from mod" would
  # never see it.
  @requires:ab.vplrf
  Scenario: the trouser step at startup raised no warning
    Then no warning matching "[TailorMade Waistlines]" was logged

  # Where this mod supplied trouser art it tells TailorMade to leave the trousers alone, one pattern
  # def per body type, made in code at startup because a def in XML cannot know whether this mod
  # actually supplied anything. Male is used because AB ships a texture for it in every pass that
  # has AB, so the def must exist in all of them. Read as a field too: a def that exists with
  # ignore false would be a def that does nothing.
  @requires:ab.vplrf
  Scenario: TailorMade is told to leave the trousers this mod supplied
    Then def "TMW_Pants_Native_Male" of type "TailorPatternDef" exists
    And def "TMW_Pants_Native_Male" field "ignore" is "True"
