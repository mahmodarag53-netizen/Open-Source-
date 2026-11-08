import React from "react";
import type { Word } from "../Episode";
import { FixScene, HardCabinetScene, RamDeskScene, RamOverflowScene, SwapScene } from "./Ep01Flat";
import { LagFlat } from "./LagFlat";
import { WifiInterferenceScene, WifiMeshScene, WifiPlaceScene, WifiRoomsScene, WifiWallsScene, WifiWavesScene } from "./Ep03Flat";
import { BitsByteScene, FullSpeedScene, MbLetterScene, MbPlanScene, SpeedtestScene } from "./Ep04Flat";
import { CrackedBoxScene, HolesScene, PhishLinkScene, ProtectScene, UsbScene, VirusDoorScene } from "./Ep05Flat";
import { HddInsideScene, HddSeekScene, SsdBootScene, SsdChipsScene, SsdRaceScene, SsdTipScene } from "./Ep02Flat";

/** name → animated scene. Content JSON references scenes by these names. */
export const SCENES: Record<string, React.FC<{ words: Word[] }>> = {
  lag: LagFlat, ramDesk: RamDeskScene, ramOverflow: RamOverflowScene, hardCabinet: HardCabinetScene, swap: SwapScene, fix: FixScene,
  ssdBoot: SsdBootScene, hddInside: HddInsideScene, hddSeek: HddSeekScene, ssdChips: SsdChipsScene, ssdRace: SsdRaceScene, ssdTip: SsdTipScene,
  wifiRooms: WifiRoomsScene, wifiWaves: WifiWavesScene, wifiWalls: WifiWallsScene, wifiInterference: WifiInterferenceScene, wifiPlace: WifiPlaceScene, wifiMesh: WifiMeshScene,
  mbPlan: MbPlanScene, mbLetter: MbLetterScene, bitsByte: BitsByteScene, fullSpeed: FullSpeedScene, speedtest: SpeedtestScene,
  virusDoor: VirusDoorScene, crackedBox: CrackedBoxScene, phishLink: PhishLinkScene, usb: UsbScene, holes: HolesScene, protect: ProtectScene,
};
