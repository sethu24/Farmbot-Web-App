import * as React from "react";
import { t } from "../../i18next_wrapper";
import { getDevice } from "../../device";
import { destroy, edit, save } from "../../api/crud";
import { ResourceColor } from "../../interfaces";
import { TaggedGenericPointer, TaggedWeedPointer } from "farmbot";
import { ListItem } from "../plants/plant_panel";
import { round, cloneDeep } from "lodash";
import { Row, Col, BlurableInput, ColorPicker } from "../../ui";
import { parseIntInput } from "../../util";
import { UUID } from "../../resources/interfaces";
import { plantAge } from "../plants/map_state_to_props";

type PointUpdate =
  Partial<TaggedGenericPointer["body"] | TaggedWeedPointer["body"]>;

export const updatePoint =
  (point: TaggedGenericPointer | TaggedWeedPointer | undefined,
    dispatch: Function) =>
    (update: PointUpdate) => {
      if (point) {
        dispatch(edit(point, update));
        dispatch(save(point.uuid));
      }
    };

export interface EditPointPropertiesProps {
  point: TaggedGenericPointer | TaggedWeedPointer;
  updatePoint(update: PointUpdate): void;
}

export const EditPointProperties = (props: EditPointPropertiesProps) =>
  <ul>
    <li>
      <Row>
        <EditPointName
          name={props.point.body.name}
          updatePoint={props.updatePoint} />
        <EditPointColor
          color={props.point.body.meta.color}
          updatePoint={props.updatePoint} />
      </Row>
    </li>
    <ListItem name={t("Location")}>
      <EditPointLocation
        xyLocation={{ x: props.point.body.x, y: props.point.body.y }}
        updatePoint={props.updatePoint} />
    </ListItem>
    <ListItem name={t("Size")}>
      <EditPointRadius
        radius={props.point.body.radius}
        updatePoint={props.updatePoint} />
    </ListItem>
  </ul>;

export const AdditionalWeedProperties = (props: EditPointPropertiesProps) =>
  <ul className="additional-weed-properties">
    <ListItem name={t("Age")}>
      {`${plantAge(props.point)} ${t("days old")}`}
    </ListItem>
    {Object.entries(props.point.body.meta).map(([key, value]) => {
      switch (key) {
        case "color":
        case "type": return <div key={key}
          className={`meta-${key}-not-displayed`} />;
        case "created_by":
          return <ListItem name={t("Source")}>
            {SOURCE_LOOKUP()[value || ""] || t("unknown")}
          </ListItem>;
        case "removal_method":
          return <ListItem name={t("Removal method")}>
            <div className="weed-removal-method-section">
              {REMOVAL_METHODS.map(method =>
                <div className={"weed-removal-method"} key={method}>
                  <input type="radio" name="weed-removal-method"
                    checked={value == method}
                    onChange={() => {
                      const newMeta = cloneDeep(props.point.body.meta);
                      newMeta.removal_method = method;
                      props.updatePoint({ meta: newMeta });
                    }} />
                  <label>{t(method)}</label>
                </div>)}
            </div>
          </ListItem>;
        default:
          return <ListItem name={key}>
            {value || ""}
          </ListItem>;
      }
    })}
  </ul>;

const REMOVAL_METHODS = ["automatic", "manual"];

const SOURCE_LOOKUP = (): Record<string, string> => ({
  "plant-detection": t("Weed Detector"),
  "farm-designer": t("Farm Designer"),
});

export interface PointActionsProps {
  x: number;
  y: number;
  z: number;
  uuid: UUID;
  dispatch: Function;
}

export const PointActions = ({ x, y, z, uuid, dispatch }: PointActionsProps) =>
  <div className={"point-actions"}>
    <button
      className="fb-button gray no-float"
      type="button"
      title={t("move to location")}
      onClick={() => getDevice().moveAbsolute({ x, y, z })}>
      {t("Move Device to location")}
    </button>
    <button
      className="fb-button red no-float"
      title={t("delete")}
      onClick={() => dispatch(destroy(uuid))}>
      {t("Delete")}
    </button>
  </div>;

export interface EditPointNameProps {
  updatePoint(update: PointUpdate): void;
  name: string;
}

export const EditPointName = (props: EditPointNameProps) =>
  <div className={"point-name-input"}>
    <Col xs={10}>
      <label>{t("Name")}</label>
      <BlurableInput
        type="text"
        name="name"
        value={props.name}
        onCommit={e => props.updatePoint({ name: e.currentTarget.value })} />
    </Col>
  </div>;

export interface EditPointLocationProps {
  updatePoint(update: PointUpdate): void;
  xyLocation: Record<"x" | "y", number>;
}

export const EditPointLocation = (props: EditPointLocationProps) =>
  <Row>
    {["x", "y"].map((axis: "x" | "y") =>
      <Col xs={6} key={axis}>
        <label style={{ marginTop: 0 }}>{t("{{axis}} (mm)", { axis })}</label>
        <BlurableInput
          type="number"
          name={axis}
          value={props.xyLocation[axis]}
          min={0}
          onCommit={e => props.updatePoint({
            [axis]: round(parseIntInput(e.currentTarget.value))
          })} />
      </Col>)}
  </Row>;

export interface EditPointRadiusProps {
  updatePoint(update: PointUpdate): void;
  radius: number;
}

export const EditPointRadius = (props: EditPointRadiusProps) =>
  <Row>
    <Col xs={6}>
      <label style={{ marginTop: 0 }}>{t("radius (mm)")}</label>
      <BlurableInput
        type="number"
        name="radius"
        value={props.radius}
        min={0}
        onCommit={e => props.updatePoint({
          radius: round(parseIntInput(e.currentTarget.value))
        })} />
    </Col>
  </Row>;

export interface EditPointColorProps {
  updatePoint(update: PointUpdate): void;
  color: string | undefined;
}

export const EditPointColor = (props: EditPointColorProps) =>
  <div className={"point-color-input"}>
    <Col xs={2}>
      <ColorPicker
        current={(props.color || "green") as ResourceColor}
        onChange={color => props.updatePoint({ meta: { color } })} />
    </Col>
  </div>;
