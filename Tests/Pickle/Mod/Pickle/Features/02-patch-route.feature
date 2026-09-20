# Scenario 1 of TESTING.md, and the reason this suite needs an assembly at all.
#
# `BandFor` is a small static method returning a switch over static fields, and whether Mono
# inlines it into its caller is a property of the process that is running. An inlined method is
# one Harmony has nothing left to patch, so the mod carries a second patch on a method too large
# to be inlined and a self-test that says which of the two is doing the work. Neither route is a
# failure; what would be one is not knowing.
#
# Tests/Check-Logic.ps1 calls both patch bodies directly and proves what they decide. It cannot
# know whether Harmony got to apply them, and no check outside a running game can.
#
# No save is loaded: everything here is settled before the main menu is drawn.
Feature: the band patch, and which of its two routes is live

  Scenario: loaded after both the mods it patches
    Then mod "nelim.tailormade.waistlines" is loaded
    And mod "nelim.tailormade.waistlines" loads after "brrainz.harmony"
    And mod "nelim.tailormade.waistlines" loads after "astryl.tailormade"

  Scenario: the patches are on TailorMade's own methods
    # A renamed method upstream is a patch that never applies, and it fails silently: the game
    # starts, logs nothing, and the sliders simply do nothing.
    Then TailorMade Waistlines patched "TailorMade.ApparelClassifier::BandFor"
    And TailorMade Waistlines patched "TailorMade.TexBake::BakeFitted"
    And TailorMade Waistlines patched "TailorMade.ApparelClassifier::ConfirmChestArt"

  Scenario: the route is settled, and TailorMade answers with our band
    Then the band patch route is settled
    When the pants band is set to 0.42
    Then TailorMade answers 0.42 for the pants band
    And the mod logged no error since startup
