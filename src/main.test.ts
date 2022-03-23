import { ProtoParser, transform } from "./main";

it("Parses an identifier", () => {
  expect(ProtoParser.identifier.tryParse("helloWorld_01")).toBe("helloWorld_01");
  expect(() => ProtoParser.identifier.tryParse("hello-World")).toThrow();
  expect(() => ProtoParser.identifier.tryParse("hello World")).toThrow();
});

it("Parses a property", () => {
  expect(ProtoParser.property.tryParse("helloWorld_01: \"value\"")).toEqual({ 
    helloWorld_01: "value"
  });
  expect(ProtoParser.property.tryParse("helloWorld_02: -1234.00276")).toEqual({
     helloWorld_02: -1234.00276
  });
  expect(ProtoParser.property.tryParse("helloWorld_03: CONSTANT_VALUE")).toEqual({
    helloWorld_03: "CONSTANT_VALUE"
  });
  expect(ProtoParser.property.tryParse("helloWorld_03: true")).toEqual({
    helloWorld_03: true
  });
  expect(ProtoParser.property.tryParse("helloWorld_03: false")).toEqual({
    helloWorld_03: false
  });
});

it("Parses an object", () => {
  const mock = `object {
    helloWorld_01: true
    helloWorld_02: false
    helloWorld_03: "value"
    helloWorld_04: 123456
    object2 {
      helloWorld_05: true
    }
  }
  `;

  expect(ProtoParser.object.tryParse(mock)).toEqual({
      object: [
        { helloWorld_01: true },
        { helloWorld_02: false },
        { helloWorld_03: "value" },
        { helloWorld_04: 123456 },
        { 
          object2: [
            { helloWorld_05: true },
          ]
        },
      ]
    });
})

it("Parses a document", () => {
  expect(ProtoParser.document.tryParse("helloWorld_01: true\nhelloWorld_02: false")).toEqual([
    { helloWorld_01: true },
    { helloWorld_02: false },
  ]);
})

it("Parses a multiline value", () => {
  const mock = `property: "value1"
"value2"
"value3"
"value4"
`;
  expect(ProtoParser.document.tryParse(mock)).toEqual([
    {property: "value1"},
    "value2",
    "value3",
    "value4"
  ]);
});

it("Parses a complex document", () => {
  const mock = `name: "main"
  instances {
    id: "player"
    prototype: "/main/go/player.go"
    position {
      x: 0.0
      y: 60.0
      z: 0.0
    }
    component_properties {
      id: "player"
      properties {
        id: "speed"
        value: "200.0"
        type: PROPERTY_TYPE_NUMBER
      }
    }
  }
  embedded_instances {
    id: "world"
    data: "components {\\n"
    "  id: \\"level-0\\"\\n"
    "  component: \\"/main/maps/level-0.tilemap\\"\\n"
    "  position {\\n"
    "    x: 0.0\\n"
    "    y: 0.0\\n"
    "    z: 0.0\\n"
    "  }\\n"
    "}\\n"
    ""
    position {
      x: -168.0
      y: 0.0
      z: -0.1
    }
  }`

  expect(ProtoParser.document.tryParse(mock)).toEqual([
    { "name": "main" },
    { "instances": [
      { "id": "player" },
      { "prototype": "/main/go/player.go" },
      { "position": [
        { "x": 0.0 },
        { "y": 60.0 },
        { "z": 0.0 },
      ]},
      { "component_properties": [
        { "id": "player" },
        { "properties": [
          { "id": "speed" },
          { "value": "200.0" },
          { "type": "PROPERTY_TYPE_NUMBER" },
        ]}
      ]},
    ]},
    { "embedded_instances": [
      { "id": "world" },
      { "data": "components {\\n" },
      "  id: \\\"level-0\\\"\\n",
      "  component: \\\"/main/maps/level-0.tilemap\\\"\\n",
      "  position {\\n",
      "    x: 0.0\\n",
      "    y: 0.0\\n",
      "    z: 0.0\\n",
      "  }\\n",
      "}\\n",
      "",
      { "position": [
        { "x": -168.0 },
        { "y": 0.0 },
        { "z": -0.1 },
      ]},
    ]},
  ]);
});

it("transforms input to json output", () => {
  const mock = `name: "main"
  instances {
    id: "player"
    prototype: "/main/go/player.go"
    position {
      x: 0.0
      y: 60.0
      z: 0.0
    }
    component_properties {
      id: "player"
      properties {
        id: "speed"
        value: "200.0"
        type: PROPERTY_TYPE_NUMBER
      }
      properties {
        id: "bounds"
        value: "168.0, 480.0, 0.0"
        type: PROPERTY_TYPE_VECTOR3
      }
      properties {
        id: "fireDelay"
        value: "0.0"
        type: PROPERTY_TYPE_NUMBER
      }
      properties {
        id: "repeatDelay"
        value: "0.1"
        type: PROPERTY_TYPE_NUMBER
      }
    }
  }
  instances {
    id: "camera"
    prototype: "/main/go/camera.go"
    position {
      x: 0.0
      y: 60.0
      z: 0.0
    }
  }
  embedded_instances {
    id: "world"
    position {
      x: -168.0
      y: 0.0
      z: -0.1
    }
  }`

  const result = transform(mock);

  expect(result).toEqual({
    name: "main",
    instances: [
      {
        id: "player",
        prototype: "/main/go/player.go",
        position: {
          x: 0.0,
          y: 60.0,
          z: 0.0,
        },
        component_properties: {
          id: "player",
          properties: [
            {
              id: "speed",
              value: "200.0",
              type: "PROPERTY_TYPE_NUMBER",
            },
            {
              id: "bounds",
              value: "168.0, 480.0, 0.0",
              type: "PROPERTY_TYPE_VECTOR3",
            },
            {
              id: "fireDelay",
              value: "0.0",
              type: "PROPERTY_TYPE_NUMBER",
            },
            {
              id: "repeatDelay",
              value: "0.1",
              type: "PROPERTY_TYPE_NUMBER",
            },
          ],
        }
      },
      {
        id: "camera",
        prototype: "/main/go/camera.go",
        position: {
          x: 0.0,
          y: 60.0,
          z: 0.0,
        },
      },
    ],
    embedded_instances: {
      id: "world",
      position: {
        x: -168.0,
        y: 0.0,
        z: -0.1,
      },
    },
  });
});