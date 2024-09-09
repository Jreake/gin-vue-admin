const dataTree = [
  {
    id: "f070532c2dfa4b8787af6f56add5b7d0",
    label: "华能尉犁光伏-电站",
    cameraIndexCode: null,
    cameraName: null,
    status: null,
    alarmStatus: null,
    totalNum: null,
    plantId: null,
    parentId: "root000000",
    type: null,
    children: [
      {
        id: "284473ba249742f68c86e2bef3173258",
        label: "华能尉犁光伏二电站",
        cameraIndexCode: null,
        cameraName: null,
        status: null,
        alarmStatus: null,
        totalNum: null,
        plantId: null,
        parentId: "f070532c2dfa4b8787af6f56add5b7d0",
        type: null,
        children: [
          {
            id: "30f51f424f894a4fa579e1c44848e6b1",
            label: "光伏区",
            cameraIndexCode: null,
            cameraName: null,
            status: null,
            alarmStatus: null,
            totalNum: null,
            plantId: null,
            parentId: "284473ba249742f68c86e2bef3173258",
            type: null,
            children: [
              {
                id: "73bfd5bdcb8b42e08fa86565a2b74043",
                label: "光伏区周界",
                cameraIndexCode: null,
                cameraName: null,
                status: null,
                alarmStatus: null,
                totalNum: null,
                plantId: null,
                parentId: "30f51f424f894a4fa579e1c44848e6b1",
                type: null,
              },
              {
                id: "8b3a8fcf85d9416797ca4ee594f47f8b",
                label: "箱变球机",
                cameraIndexCode: null,
                cameraName: null,
                status: null,
                alarmStatus: null,
                totalNum: null,
                plantId: null,
                parentId: "30f51f424f894a4fa579e1c44848e6b1",
                type: null,
                children: [
                  {
                    id: "0ad738bdb01041bcb5e0f4340f01a493",
                    label: "光伏区29号箱变",
                    cameraIndexCode: null,
                    cameraName: null,
                    status: 0,
                    alarmStatus: null,
                    totalNum: null,
                    plantId: null,
                    parentId: "8b3a8fcf85d9416797ca4ee594f47f8b",
                    type: null,
                  },
                  {
                    id: "17d42005c9da49d49a6fa17fe4bf0cc1",
                    label: "光伏区24号箱变",
                    cameraIndexCode: null,
                    cameraName: null,
                    status: 0,
                    alarmStatus: null,
                    totalNum: null,
                    plantId: null,
                    parentId: "8b3a8fcf85d9416797ca4ee594f47f8b",
                    type: null,
                  },
                  {
                    id: "184b8eb113fa49b094b4dcf9c4e1209f",
                    label: "光伏区2号箱变",
                    cameraIndexCode: null,
                    cameraName: null,
                    status: 0,
                    alarmStatus: null,
                    totalNum: null,
                    plantId: null,
                    parentId: "8b3a8fcf85d9416797ca4ee594f47f8b",
                    type: null,
                  },
                ],
              },
              {
                id: "bbc36872f0544143aa4637b178e284db",
                label: "箱变油位计",
                cameraIndexCode: null,
                cameraName: null,
                status: null,
                alarmStatus: null,
                totalNum: null,
                plantId: null,
                parentId: "30f51f424f894a4fa579e1c44848e6b1",
                type: null,
                children: [
                  {
                    id: "072f03cea5a44b17b4fd27e72173f6e7",
                    label: "34团-3（箱变油位计）",
                    cameraIndexCode: null,
                    cameraName: null,
                    status: 0,
                    alarmStatus: null,
                    totalNum: null,
                    plantId: null,
                    parentId: "bbc36872f0544143aa4637b178e284db",
                    type: null,
                  },
                  {
                    id: "08f595088018409fb6bf00efa8331175",
                    label: "34团-25（箱变油位计）",
                    cameraIndexCode: null,
                    cameraName: null,
                    status: 0,
                    alarmStatus: null,
                    totalNum: null,
                    plantId: null,
                    parentId: "bbc36872f0544143aa4637b178e284db",
                    type: null,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

function getLastLevelData(dataTree, count = 4) {
  const lastLevelData = [];

  function traverse(nodes) {
    for (const node of nodes) {
      if (node.children) {
        traverse(node.children);
      } else {
        lastLevelData.push({ name: node.name, id: node.id });
        if (lastLevelData.length === count) {
          return lastLevelData;
        }
      }
    }
  }

  return traverse(dataTree);
}

const lastLevelData = getLastLevelData(dataTree);
console.log(lastLevelData);
