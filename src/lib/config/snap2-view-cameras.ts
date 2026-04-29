export type Snap2ViewCamera = {
  name: string;
  cameraGroupId: number;
};

export const SNAP2_PLAN_VIEW_GROUP_ID = 86;

const perspective: Snap2ViewCamera = {
  name: 'Perspective View',
  cameraGroupId: 0,
};

const planView: Snap2ViewCamera = {
  name: 'Plan View',
  cameraGroupId: SNAP2_PLAN_VIEW_GROUP_ID,
};

export const Snap2ViewCameras: Snap2ViewCamera[] = [perspective, planView];
