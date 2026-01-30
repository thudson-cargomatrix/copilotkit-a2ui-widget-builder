# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# The A2UI schema remains constant for all A2UI responses.
A2UI_SCHEMA = r'''
{
  "title": "A2UI Message Schema",
  "description": "Describes a JSON payload for an A2UI (Agent to UI) message, which is used to dynamically construct and update user interfaces. A message MUST contain exactly ONE of the action properties: 'beginRendering', 'surfaceUpdate', 'dataModelUpdate', or 'deleteSurface'.",
  "type": "object",
  "properties": {
    "beginRendering": {
      "type": "object",
      "description": "Signals the client to begin rendering a surface with a root component and specific styles.",
      "properties": {
        "surfaceId": {
          "type": "string",
          "description": "The unique identifier for the UI surface to be rendered."
        },
        "root": {
          "type": "string",
          "description": "The ID of the root component to render."
        },
        "styles": {
          "type": "object",
          "description": "Styling information for the UI.",
          "properties": {
            "font": {
              "type": "string",
              "description": "The primary font for the UI."
            },
            "primaryColor": {
              "type": "string",
              "description": "The primary UI color as a hexadecimal code (e.g., '#00BFFF').",
              "pattern": "^#[0-9a-fA-F]{6}$"
            }
          }
        }
      },
      "required": ["root", "surfaceId"]
    },
    "surfaceUpdate": {
      "type": "object",
      "description": "Updates a surface with a new set of components.",
      "properties": {
        "surfaceId": {
          "type": "string",
          "description": "The unique identifier for the UI surface to be updated. If you are adding a new surface this *must* be a new, unique identified that has never been used for any existing surfaces shown."
        },
        "components": {
          "type": "array",
          "description": "A list containing all UI components for the surface.",
          "minItems": 1,
          "items": {
            "type": "object",
            "description": "Represents a *single* component in a UI widget tree. This component could be one of many supported types.",
            "properties": {
              "id": {
                "type": "string",
                "description": "The unique identifier for this component."
              },
              "weight": {
                "type": "number",
                "description": "The relative weight of this component within a Row or Column. This corresponds to the CSS 'flex-grow' property. Note: this may ONLY be set when the component is a direct descendant of a Row or Column."
              },
              "component": {
                "type": "object",
                "description": "A wrapper object that MUST contain exactly one key, which is the name of the component type (e.g., 'Heading'). The value is an object containing the properties for that specific component.",
                "properties": {
                  "Text": {
                    "type": "object",
                    "properties": {
                      "text": {
                        "type": "object",
                        "description": "The text content to display. This can be a literal string or a reference to a value in the data model ('path', e.g., '/doc/title'). While simple Markdown formatting is supported (i.e. without HTML, images, or links), utilizing dedicated UI components is generally preferred for a richer and more structured presentation.",
                        "properties": {
                          "literalString": {
                            "type": "string"
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      },
                      "usageHint": {
                        "type": "string",
                        "description": "A hint for the base text style. One of:\n- `h1`: Largest heading.\n- `h2`: Second largest heading.\n- `h3`: Third largest heading.\n- `h4`: Fourth largest heading.\n- `h5`: Fifth largest heading.\n- `caption`: Small text for captions.\n- `body`: Standard body text.",
                        "enum": [
                          "h1",
                          "h2",
                          "h3",
                          "h4",
                          "h5",
                          "caption",
                          "body"
                        ]
                      }
                    },
                    "required": ["text"]
                  },
                  "Image": {
                    "type": "object",
                    "properties": {
                      "url": {
                        "type": "object",
                        "description": "The URL of the image to display. This can be a literal string ('literal') or a reference to a value in the data model ('path', e.g. '/thumbnail/url').",
                        "properties": {
                          "literalString": {
                            "type": "string"
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      },
                      "fit": {
                        "type": "string",
                        "description": "Specifies how the image should be resized to fit its container. This corresponds to the CSS 'object-fit' property.",
                        "enum": [
                          "contain",
                          "cover",
                          "fill",
                          "none",
                          "scale-down"
                        ]
                      },
                      "usageHint": {
                        "type": "string",
                        "description": "A hint for the image size and style. One of:\n- `icon`: Small square icon.\n- `avatar`: Circular avatar image.\n- `smallFeature`: Small feature image.\n- `mediumFeature`: Medium feature image.\n- `largeFeature`: Large feature image.\n- `header`: Full-width, full bleed, header image.",
                        "enum": [
                          "icon",
                          "avatar",
                          "smallFeature",
                          "mediumFeature",
                          "largeFeature",
                          "header"
                        ]
                      }
                    },
                    "required": ["url"]
                  },
                  "Icon": {
                    "type": "object",
                    "properties": {
                      "name": {
                        "type": "object",
                        "description": "The name of the icon to display. This can be a literal string or a reference to a value in the data model ('path', e.g. '/form/submit').",
                        "properties": {
                          "literalString": {
                            "type": "string",
                            "enum": [
                              "accountCircle",
                              "add",
                              "arrowBack",
                              "arrowForward",
                              "attachFile",
                              "calendarToday",
                              "call",
                              "camera",
                              "check",
                              "close",
                              "delete",
                              "download",
                              "edit",
                              "event",
                              "error",
                              "favorite",
                              "favoriteOff",
                              "folder",
                              "help",
                              "home",
                              "info",
                              "locationOn",
                              "lock",
                              "lockOpen",
                              "mail",
                              "menu",
                              "moreVert",
                              "moreHoriz",
                              "notificationsOff",
                              "notifications",
                              "payment",
                              "person",
                              "phone",
                              "photo",
                              "print",
                              "refresh",
                              "search",
                              "send",
                              "settings",
                              "share",
                              "shoppingCart",
                              "star",
                              "starHalf",
                              "starOff",
                              "upload",
                              "visibility",
                              "visibilityOff",
                              "warning"
                            ]
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      }
                    },
                    "required": ["name"]
                  },
                  "Video": {
                    "type": "object",
                    "properties": {
                      "url": {
                        "type": "object",
                        "description": "The URL of the video to display. This can be a literal string or a reference to a value in the data model ('path', e.g. '/video/url').",
                        "properties": {
                          "literalString": {
                            "type": "string"
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      }
                    },
                    "required": ["url"]
                  },
                  "AudioPlayer": {
                    "type": "object",
                    "properties": {
                      "url": {
                        "type": "object",
                        "description": "The URL of the audio to be played. This can be a literal string ('literal') or a reference to a value in the data model ('path', e.g. '/song/url').",
                        "properties": {
                          "literalString": {
                            "type": "string"
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      },
                      "description": {
                        "type": "object",
                        "description": "A description of the audio, such as a title or summary. This can be a literal string or a reference to a value in the data model ('path', e.g. '/song/title').",
                        "properties": {
                          "literalString": {
                            "type": "string"
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      }
                    },
                    "required": ["url"]
                  },
                  "Row": {
                    "type": "object",
                    "properties": {
                      "children": {
                        "type": "object",
                        "description": "Defines the children. Use 'explicitList' for a fixed set of children, or 'template' to generate children from a data list.",
                        "properties": {
                          "explicitList": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          },
                          "template": {
                            "type": "object",
                            "description": "A template for generating a dynamic list of children from a data model list. `componentId` is the component to use as a template, and `dataBinding` is the path to the map of components in the data model. Values in the map will define the list of children.",
                            "properties": {
                              "componentId": {
                                "type": "string"
                              },
                              "dataBinding": {
                                "type": "string"
                              }
                            },
                            "required": ["componentId", "dataBinding"]
                          }
                        }
                      },
                      "distribution": {
                        "type": "string",
                        "description": "Defines the arrangement of children along the main axis (horizontally). This corresponds to the CSS 'justify-content' property.",
                        "enum": [
                          "center",
                          "end",
                          "spaceAround",
                          "spaceBetween",
                          "spaceEvenly",
                          "start"
                        ]
                      },
                      "alignment": {
                        "type": "string",
                        "description": "Defines the alignment of children along the cross axis (vertically). This corresponds to the CSS 'align-items' property.",
                        "enum": ["start", "center", "end", "stretch"]
                      }
                    },
                    "required": ["children"]
                  },
                  "Column": {
                    "type": "object",
                    "properties": {
                      "children": {
                        "type": "object",
                        "description": "Defines the children. Use 'explicitList' for a fixed set of children, or 'template' to generate children from a data list.",
                        "properties": {
                          "explicitList": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          },
                          "template": {
                            "type": "object",
                            "description": "A template for generating a dynamic list of children from a data model list. `componentId` is the component to use as a template, and `dataBinding` is the path to the map of components in the data model. Values in the map will define the list of children.",
                            "properties": {
                              "componentId": {
                                "type": "string"
                              },
                              "dataBinding": {
                                "type": "string"
                              }
                            },
                            "required": ["componentId", "dataBinding"]
                          }
                        }
                      },
                      "distribution": {
                        "type": "string",
                        "description": "Defines the arrangement of children along the main axis (vertically). This corresponds to the CSS 'justify-content' property.",
                        "enum": [
                          "start",
                          "center",
                          "end",
                          "spaceBetween",
                          "spaceAround",
                          "spaceEvenly"
                        ]
                      },
                      "alignment": {
                        "type": "string",
                        "description": "Defines the alignment of children along the cross axis (horizontally). This corresponds to the CSS 'align-items' property.",
                        "enum": ["center", "end", "start", "stretch"]
                      }
                    },
                    "required": ["children"]
                  },
                  "List": {
                    "type": "object",
                    "properties": {
                      "children": {
                        "type": "object",
                        "description": "Defines the children. Use 'explicitList' for a fixed set of children, or 'template' to generate children from a data list.",
                        "properties": {
                          "explicitList": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          },
                          "template": {
                            "type": "object",
                            "description": "A template for generating a dynamic list of children from a data model list. `componentId` is the component to use as a template, and `dataBinding` is the path to the map of components in the data model. Values in the map will define the list of children.",
                            "properties": {
                              "componentId": {
                                "type": "string"
                              },
                              "dataBinding": {
                                "type": "string"
                              }
                            },
                            "required": ["componentId", "dataBinding"]
                          }
                        }
                      },
                      "direction": {
                        "type": "string",
                        "description": "The direction in which the list items are laid out.",
                        "enum": ["vertical", "horizontal"]
                      },
                      "alignment": {
                        "type": "string",
                        "description": "Defines the alignment of children along the cross axis.",
                        "enum": ["start", "center", "end", "stretch"]
                      }
                    },
                    "required": ["children"]
                  },
                  "Card": {
                    "type": "object",
                    "properties": {
                      "child": {
                        "type": "string",
                        "description": "The ID of the component to be rendered inside the card."
                      }
                    },
                    "required": ["child"]
                  },
                  "Tabs": {
                    "type": "object",
                    "properties": {
                      "tabItems": {
                        "type": "array",
                        "description": "An array of objects, where each object defines a tab with a title and a child component.",
                        "items": {
                          "type": "object",
                          "properties": {
                            "title": {
                              "type": "object",
                              "description": "The tab title. Defines the value as either a literal value or a path to data model value (e.g. '/options/title').",
                              "properties": {
                                "literalString": {
                                  "type": "string"
                                },
                                "path": {
                                  "type": "string"
                                }
                              }
                            },
                            "child": {
                              "type": "string"
                            }
                          },
                          "required": ["title", "child"]
                        }
                      }
                    },
                    "required": ["tabItems"]
                  },
                  "Divider": {
                    "type": "object",
                    "properties": {
                      "axis": {
                        "type": "string",
                        "description": "The orientation of the divider.",
                        "enum": ["horizontal", "vertical"]
                      }
                    }
                  },
                  "Modal": {
                    "type": "object",
                    "properties": {
                      "entryPointChild": {
                        "type": "string",
                        "description": "The ID of the component that opens the modal when interacted with (e.g., a button)."
                      },
                      "contentChild": {
                        "type": "string",
                        "description": "The ID of the component to be displayed inside the modal."
                      }
                    },
                    "required": ["entryPointChild", "contentChild"]
                  },
                  "Button": {
                    "type": "object",
                    "properties": {
                      "child": {
                        "type": "string",
                        "description": "The ID of the component to display in the button, typically a Text component."
                      },
                      "primary": {
                        "type": "boolean",
                        "description": "Indicates if this button should be styled as the primary action."
                      },
                      "action": {
                        "type": "object",
                        "description": "The client-side action to be dispatched when the button is clicked. It includes the action's name and an optional context payload.",
                        "properties": {
                          "name": {
                            "type": "string"
                          },
                          "context": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "key": {
                                  "type": "string"
                                },
                                "value": {
                                  "type": "object",
                                  "description": "Defines the value to be included in the context as either a literal value or a path to a data model value (e.g. '/user/name').",
                                  "properties": {
                                    "path": {
                                      "type": "string"
                                    },
                                    "literalString": {
                                      "type": "string"
                                    },
                                    "literalNumber": {
                                      "type": "number"
                                    },
                                    "literalBoolean": {
                                      "type": "boolean"
                                    }
                                  }
                                }
                              },
                              "required": ["key", "value"]
                            }
                          }
                        },
                        "required": ["name"]
                      }
                    },
                    "required": ["child", "action"]
                  },
                  "CheckBox": {
                    "type": "object",
                    "properties": {
                      "label": {
                        "type": "object",
                        "description": "The text to display next to the checkbox. Defines the value as either a literal value or a path to data model ('path', e.g. '/option/label').",
                        "properties": {
                          "literalString": {
                            "type": "string"
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      },
                      "value": {
                        "type": "object",
                        "description": "The current state of the checkbox (true for checked, false for unchecked). This can be a literal boolean ('literalBoolean') or a reference to a value in the data model ('path', e.g. '/filter/open').",
                        "properties": {
                          "literalBoolean": {
                            "type": "boolean"
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      }
                    },
                    "required": ["label", "value"]
                  },
                  "TextField": {
                    "type": "object",
                    "properties": {
                      "label": {
                        "type": "object",
                        "description": "The text label for the input field. This can be a literal string or a reference to a value in the data model ('path, e.g. '/user/name').",
                        "properties": {
                          "literalString": {
                            "type": "string"
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      },
                      "text": {
                        "type": "object",
                        "description": "The value of the text field. This can be a literal string or a reference to a value in the data model ('path', e.g. '/user/name').",
                        "properties": {
                          "literalString": {
                            "type": "string"
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      },
                      "textFieldType": {
                        "type": "string",
                        "description": "The type of input field to display.",
                        "enum": [
                          "date",
                          "longText",
                          "number",
                          "shortText",
                          "obscured"
                        ]
                      },
                      "validationRegexp": {
                        "type": "string",
                        "description": "A regular expression used for client-side validation of the input."
                      }
                    },
                    "required": ["label"]
                  },
                  "DateTimeInput": {
                    "type": "object",
                    "properties": {
                      "value": {
                        "type": "object",
                        "description": "The selected date and/or time value. This can be a literal string ('literalString') or a reference to a value in the data model ('path', e.g. '/user/dob').",
                        "properties": {
                          "literalString": {
                            "type": "string"
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      },
                      "enableDate": {
                        "type": "boolean",
                        "description": "If true, allows the user to select a date."
                      },
                      "enableTime": {
                        "type": "boolean",
                        "description": "If true, allows the user to select a time."
                      },
                      "outputFormat": {
                        "type": "string",
                        "description": "The desired format for the output string after a date or time is selected."
                      }
                    },
                    "required": ["value"]
                  },
                  "MultipleChoice": {
                    "type": "object",
                    "properties": {
                      "selections": {
                        "type": "object",
                        "description": "The currently selected values for the component. This can be a literal array of strings or a path to an array in the data model('path', e.g. '/hotel/options').",
                        "properties": {
                          "literalArray": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      },
                      "options": {
                        "type": "array",
                        "description": "An array of available options for the user to choose from.",
                        "items": {
                          "type": "object",
                          "properties": {
                            "label": {
                              "type": "object",
                              "description": "The text to display for this option. This can be a literal string or a reference to a value in the data model (e.g. '/option/label').",
                              "properties": {
                                "literalString": {
                                  "type": "string"
                                },
                                "path": {
                                  "type": "string"
                                }
                              }
                            },
                            "value": {
                              "type": "string",
                              "description": "The value to be associated with this option when selected."
                            }
                          },
                          "required": ["label", "value"]
                        }
                      },
                      "maxAllowedSelections": {
                        "type": "integer",
                        "description": "The maximum number of options that the user is allowed to select."
                      }
                    },
                    "required": ["selections", "options"]
                  },
                  "Slider": {
                    "type": "object",
                    "properties": {
                      "value": {
                        "type": "object",
                        "description": "The current value of the slider. This can be a literal number ('literalNumber') or a reference to a value in the data model ('path', e.g. '/restaurant/cost').",
                        "properties": {
                          "literalNumber": {
                            "type": "number"
                          },
                          "path": {
                            "type": "string"
                          }
                        }
                      },
                      "minValue": {
                        "type": "number",
                        "description": "The minimum value of the slider."
                      },
                      "maxValue": {
                        "type": "number",
                        "description": "The maximum value of the slider."
                      }
                    },
                    "required": ["value"]
                  }
                }
              }
            },
            "required": ["id", "component"]
          }
        }
      },
      "required": ["surfaceId", "components"]
    },
    "dataModelUpdate": {
      "type": "object",
      "description": "Updates the data model for a surface.",
      "properties": {
        "surfaceId": {
          "type": "string",
          "description": "The unique identifier for the UI surface this data model update applies to."
        },
        "path": {
          "type": "string",
          "description": "An optional path to a location within the data model (e.g., '/user/name'). If omitted, or set to '/', the entire data model will be replaced."
        },
        "contents": {
          "type": "array",
          "description": "An array of data entries. Each entry must contain a 'key' and exactly one corresponding typed 'value*' property.",
          "items": {
            "type": "object",
            "description": "A single data entry. Exactly one 'value*' property should be provided alongside the key.",
            "properties": {
              "key": {
                "type": "string",
                "description": "The key for this data entry."
              },
              "valueString": {
                "type": "string"
              },
              "valueNumber": {
                "type": "number"
              },
              "valueBoolean": {
                "type": "boolean"
              },
              "valueMap": {
                "description": "Represents a map as an adjacency list.",
                "type": "array",
                "items": {
                  "type": "object",
                  "description": "One entry in the map. Exactly one 'value*' property should be provided alongside the key.",
                  "properties": {
                    "key": {
                      "type": "string"
                    },
                    "valueString": {
                      "type": "string"
                    },
                    "valueNumber": {
                      "type": "number"
                    },
                    "valueBoolean": {
                      "type": "boolean"
                    }
                  },
                  "required": ["key"]
                }
              }
            },
            "required": ["key"]
          }
        }
      },
      "required": ["contents", "surfaceId"]
    },
    "deleteSurface": {
      "type": "object",
      "description": "Signals the client to delete the surface identified by 'surfaceId'.",
      "properties": {
        "surfaceId": {
          "type": "string",
          "description": "The unique identifier for the UI surface to be deleted."
        }
      },
      "required": ["surfaceId"]
    }
  }
}
'''

GENERAL_UI_EXAMPLES = """
The following are reference examples showing A2UI JSON structure. You should use these as inspiration
but CREATE YOUR OWN unique layouts based on what the user requests. Be creative!

---BEGIN CARD_LIST_EXAMPLE---
Shows a vertical list of cards with image, title, description, and action button.
[
  {{ "beginRendering": {{ "surfaceId": "default", "root": "root-column", "styles": {{ "primaryColor": "#6366F1", "font": "Inter" }} }} }},
  {{ "surfaceUpdate": {{
    "surfaceId": "default",
    "components": [
      {{ "id": "root-column", "component": {{ "Column": {{ "children": {{ "explicitList": ["title-heading", "item-list"] }} }} }} }},
      {{ "id": "title-heading", "component": {{ "Text": {{ "usageHint": "h1", "text": {{ "literalString": "Your Items" }} }} }} }},
      {{ "id": "item-list", "component": {{ "List": {{ "direction": "vertical", "children": {{ "template": {{ "componentId": "item-card-template", "dataBinding": "/items" }} }} }} }} }},
      {{ "id": "item-card-template", "component": {{ "Card": {{ "child": "card-layout" }} }} }},
      {{ "id": "card-layout", "component": {{ "Row": {{ "children": {{ "explicitList": ["template-image", "card-details"] }} }} }} }},
      {{ "id": "template-image", "weight": 1, "component": {{ "Image": {{ "url": {{ "path": "imageUrl" }}, "usageHint": "smallFeature" }} }} }},
      {{ "id": "card-details", "weight": 2, "component": {{ "Column": {{ "children": {{ "explicitList": ["template-name", "template-desc", "template-action"] }} }} }} }},
      {{ "id": "template-name", "component": {{ "Text": {{ "usageHint": "h3", "text": {{ "path": "name" }} }} }} }},
      {{ "id": "template-desc", "component": {{ "Text": {{ "text": {{ "path": "description" }} }} }} }},
      {{ "id": "template-action", "component": {{ "Button": {{ "child": "action-text", "primary": true, "action": {{ "name": "item_selected", "context": [ {{ "key": "itemId", "value": {{ "path": "id" }} }} ] }} }} }} }},
      {{ "id": "action-text", "component": {{ "Text": {{ "text": {{ "literalString": "Select" }} }} }} }}
    ]
  }} }},
  {{ "dataModelUpdate": {{
    "surfaceId": "default",
    "path": "/",
    "contents": [
      {{ "key": "items", "valueMap": [
        {{ "key": "item1", "valueMap": [
          {{ "key": "id", "valueString": "1" }},
          {{ "key": "name", "valueString": "Item Name" }},
          {{ "key": "description", "valueString": "Item description here" }},
          {{ "key": "imageUrl", "valueString": "https://picsum.photos/200" }}
        ] }}
      ] }}
    ]
  }} }}
]
---END CARD_LIST_EXAMPLE---

---BEGIN FORM_EXAMPLE---
Shows a form with various input types and a submit button.
[
  {{ "beginRendering": {{ "surfaceId": "form", "root": "form-column", "styles": {{ "primaryColor": "#10B981", "font": "Inter" }} }} }},
  {{ "surfaceUpdate": {{
    "surfaceId": "form",
    "components": [
      {{ "id": "form-column", "component": {{ "Column": {{ "children": {{ "explicitList": ["form-title", "name-field", "email-field", "date-field", "message-field", "agree-checkbox", "submit-btn"] }} }} }} }},
      {{ "id": "form-title", "component": {{ "Text": {{ "usageHint": "h2", "text": {{ "literalString": "Contact Form" }} }} }} }},
      {{ "id": "name-field", "component": {{ "TextField": {{ "label": {{ "literalString": "Name" }}, "text": {{ "path": "name" }}, "textFieldType": "shortText" }} }} }},
      {{ "id": "email-field", "component": {{ "TextField": {{ "label": {{ "literalString": "Email" }}, "text": {{ "path": "email" }}, "textFieldType": "shortText" }} }} }},
      {{ "id": "date-field", "component": {{ "DateTimeInput": {{ "value": {{ "path": "date" }}, "enableDate": true, "enableTime": false }} }} }},
      {{ "id": "message-field", "component": {{ "TextField": {{ "label": {{ "literalString": "Message" }}, "text": {{ "path": "message" }}, "textFieldType": "longText" }} }} }},
      {{ "id": "agree-checkbox", "component": {{ "CheckBox": {{ "label": {{ "literalString": "I agree to the terms" }}, "value": {{ "path": "agreed" }} }} }} }},
      {{ "id": "submit-btn", "component": {{ "Button": {{ "child": "submit-text", "primary": true, "action": {{ "name": "submit_form", "context": [ {{ "key": "name", "value": {{ "path": "name" }} }}, {{ "key": "email", "value": {{ "path": "email" }} }}, {{ "key": "message", "value": {{ "path": "message" }} }} ] }} }} }} }},
      {{ "id": "submit-text", "component": {{ "Text": {{ "text": {{ "literalString": "Submit" }} }} }} }}
    ]
  }} }},
  {{ "dataModelUpdate": {{
    "surfaceId": "form",
    "path": "/",
    "contents": [
      {{ "key": "name", "valueString": "" }},
      {{ "key": "email", "valueString": "" }},
      {{ "key": "date", "valueString": "" }},
      {{ "key": "message", "valueString": "" }},
      {{ "key": "agreed", "valueBoolean": false }}
    ]
  }} }}
]
---END FORM_EXAMPLE---

---BEGIN DASHBOARD_EXAMPLE---
Shows a dashboard with stats cards, tabs, and a grid layout.
[
  {{ "beginRendering": {{ "surfaceId": "dashboard", "root": "dashboard-root", "styles": {{ "primaryColor": "#8B5CF6", "font": "Inter" }} }} }},
  {{ "surfaceUpdate": {{
    "surfaceId": "dashboard",
    "components": [
      {{ "id": "dashboard-root", "component": {{ "Column": {{ "children": {{ "explicitList": ["dash-title", "stats-row", "divider", "content-tabs"] }} }} }} }},
      {{ "id": "dash-title", "component": {{ "Text": {{ "usageHint": "h1", "text": {{ "literalString": "Dashboard" }} }} }} }},
      {{ "id": "stats-row", "component": {{ "Row": {{ "distribution": "spaceEvenly", "children": {{ "explicitList": ["stat-card-1", "stat-card-2", "stat-card-3"] }} }} }} }},
      {{ "id": "stat-card-1", "weight": 1, "component": {{ "Card": {{ "child": "stat-1-content" }} }} }},
      {{ "id": "stat-1-content", "component": {{ "Column": {{ "alignment": "center", "children": {{ "explicitList": ["stat-1-icon", "stat-1-value", "stat-1-label"] }} }} }} }},
      {{ "id": "stat-1-icon", "component": {{ "Icon": {{ "name": {{ "literalString": "person" }} }} }} }},
      {{ "id": "stat-1-value", "component": {{ "Text": {{ "usageHint": "h2", "text": {{ "path": "/stats/users" }} }} }} }},
      {{ "id": "stat-1-label", "component": {{ "Text": {{ "usageHint": "caption", "text": {{ "literalString": "Total Users" }} }} }} }},
      {{ "id": "stat-card-2", "weight": 1, "component": {{ "Card": {{ "child": "stat-2-content" }} }} }},
      {{ "id": "stat-2-content", "component": {{ "Column": {{ "alignment": "center", "children": {{ "explicitList": ["stat-2-icon", "stat-2-value", "stat-2-label"] }} }} }} }},
      {{ "id": "stat-2-icon", "component": {{ "Icon": {{ "name": {{ "literalString": "shoppingCart" }} }} }} }},
      {{ "id": "stat-2-value", "component": {{ "Text": {{ "usageHint": "h2", "text": {{ "path": "/stats/orders" }} }} }} }},
      {{ "id": "stat-2-label", "component": {{ "Text": {{ "usageHint": "caption", "text": {{ "literalString": "Orders" }} }} }} }},
      {{ "id": "stat-card-3", "weight": 1, "component": {{ "Card": {{ "child": "stat-3-content" }} }} }},
      {{ "id": "stat-3-content", "component": {{ "Column": {{ "alignment": "center", "children": {{ "explicitList": ["stat-3-icon", "stat-3-value", "stat-3-label"] }} }} }} }},
      {{ "id": "stat-3-icon", "component": {{ "Icon": {{ "name": {{ "literalString": "star" }} }} }} }},
      {{ "id": "stat-3-value", "component": {{ "Text": {{ "usageHint": "h2", "text": {{ "path": "/stats/rating" }} }} }} }},
      {{ "id": "stat-3-label", "component": {{ "Text": {{ "usageHint": "caption", "text": {{ "literalString": "Avg Rating" }} }} }} }},
      {{ "id": "divider", "component": {{ "Divider": {{ "axis": "horizontal" }} }} }},
      {{ "id": "content-tabs", "component": {{ "Tabs": {{ "tabItems": [ {{ "title": {{ "literalString": "Overview" }}, "child": "tab-overview" }}, {{ "title": {{ "literalString": "Details" }}, "child": "tab-details" }} ] }} }} }},
      {{ "id": "tab-overview", "component": {{ "Text": {{ "text": {{ "literalString": "Overview content goes here..." }} }} }} }},
      {{ "id": "tab-details", "component": {{ "Text": {{ "text": {{ "literalString": "Detailed information goes here..." }} }} }} }}
    ]
  }} }},
  {{ "dataModelUpdate": {{
    "surfaceId": "dashboard",
    "path": "/",
    "contents": [
      {{ "key": "stats", "valueMap": [
        {{ "key": "users", "valueString": "1,234" }},
        {{ "key": "orders", "valueString": "567" }},
        {{ "key": "rating", "valueString": "4.8" }}
      ] }}
    ]
  }} }}
]
---END DASHBOARD_EXAMPLE---

---BEGIN PROFILE_CARD_EXAMPLE---
Shows a user profile card with avatar, info, and action buttons.
[
  {{ "beginRendering": {{ "surfaceId": "profile", "root": "profile-card", "styles": {{ "primaryColor": "#F59E0B", "font": "Inter" }} }} }},
  {{ "surfaceUpdate": {{
    "surfaceId": "profile",
    "components": [
      {{ "id": "profile-card", "component": {{ "Card": {{ "child": "profile-content" }} }} }},
      {{ "id": "profile-content", "component": {{ "Column": {{ "alignment": "center", "children": {{ "explicitList": ["avatar", "user-name", "user-bio", "divider", "action-row"] }} }} }} }},
      {{ "id": "avatar", "component": {{ "Image": {{ "url": {{ "path": "/user/avatar" }}, "usageHint": "avatar" }} }} }},
      {{ "id": "user-name", "component": {{ "Text": {{ "usageHint": "h2", "text": {{ "path": "/user/name" }} }} }} }},
      {{ "id": "user-bio", "component": {{ "Text": {{ "usageHint": "body", "text": {{ "path": "/user/bio" }} }} }} }},
      {{ "id": "divider", "component": {{ "Divider": {{}} }} }},
      {{ "id": "action-row", "component": {{ "Row": {{ "distribution": "spaceEvenly", "children": {{ "explicitList": ["msg-btn", "follow-btn"] }} }} }} }},
      {{ "id": "msg-btn", "component": {{ "Button": {{ "child": "msg-text", "action": {{ "name": "send_message", "context": [ {{ "key": "userId", "value": {{ "path": "/user/id" }} }} ] }} }} }} }},
      {{ "id": "msg-text", "component": {{ "Text": {{ "text": {{ "literalString": "Message" }} }} }} }},
      {{ "id": "follow-btn", "component": {{ "Button": {{ "child": "follow-text", "primary": true, "action": {{ "name": "follow_user", "context": [ {{ "key": "userId", "value": {{ "path": "/user/id" }} }} ] }} }} }} }},
      {{ "id": "follow-text", "component": {{ "Text": {{ "text": {{ "literalString": "Follow" }} }} }} }}
    ]
  }} }},
  {{ "dataModelUpdate": {{
    "surfaceId": "profile",
    "path": "/",
    "contents": [
      {{ "key": "user", "valueMap": [
        {{ "key": "id", "valueString": "123" }},
        {{ "key": "name", "valueString": "Jane Doe" }},
        {{ "key": "bio", "valueString": "Software developer and UI enthusiast" }},
        {{ "key": "avatar", "valueString": "https://i.pravatar.cc/150" }}
      ] }}
    ]
  }} }}
]
---END PROFILE_CARD_EXAMPLE---

---BEGIN GRID_GALLERY_EXAMPLE---
Shows a two-column image gallery with captions.
[
  {{ "beginRendering": {{ "surfaceId": "gallery", "root": "gallery-root", "styles": {{ "primaryColor": "#EC4899", "font": "Inter" }} }} }},
  {{ "surfaceUpdate": {{
    "surfaceId": "gallery",
    "components": [
      {{ "id": "gallery-root", "component": {{ "Column": {{ "children": {{ "explicitList": ["gallery-title", "gallery-grid"] }} }} }} }},
      {{ "id": "gallery-title", "component": {{ "Text": {{ "usageHint": "h1", "text": {{ "literalString": "Photo Gallery" }} }} }} }},
      {{ "id": "gallery-grid", "component": {{ "Row": {{ "children": {{ "explicitList": ["col-1", "col-2"] }} }} }} }},
      {{ "id": "col-1", "weight": 1, "component": {{ "Column": {{ "children": {{ "explicitList": ["img-1", "cap-1"] }} }} }} }},
      {{ "id": "img-1", "component": {{ "Image": {{ "url": {{ "path": "/images/0/url" }}, "usageHint": "mediumFeature", "fit": "cover" }} }} }},
      {{ "id": "cap-1", "component": {{ "Text": {{ "usageHint": "caption", "text": {{ "path": "/images/0/caption" }} }} }} }},
      {{ "id": "col-2", "weight": 1, "component": {{ "Column": {{ "children": {{ "explicitList": ["img-2", "cap-2"] }} }} }} }},
      {{ "id": "img-2", "component": {{ "Image": {{ "url": {{ "path": "/images/1/url" }}, "usageHint": "mediumFeature", "fit": "cover" }} }} }},
      {{ "id": "cap-2", "component": {{ "Text": {{ "usageHint": "caption", "text": {{ "path": "/images/1/caption" }} }} }} }}
    ]
  }} }},
  {{ "dataModelUpdate": {{
    "surfaceId": "gallery",
    "path": "/",
    "contents": [
      {{ "key": "images", "valueMap": [
        {{ "key": "0", "valueMap": [
          {{ "key": "url", "valueString": "https://picsum.photos/400/300" }},
          {{ "key": "caption", "valueString": "Beautiful landscape" }}
        ] }},
        {{ "key": "1", "valueMap": [
          {{ "key": "url", "valueString": "https://picsum.photos/400/301" }},
          {{ "key": "caption", "valueString": "City skyline" }}
        ] }}
      ] }}
    ]
  }} }}
]
---END GRID_GALLERY_EXAMPLE---
"""


def get_ui_prompt(base_url: str, examples: str) -> str:
    """
    Constructs the full prompt with UI instructions, rules, examples, and schema.

    Args:
        base_url: The base URL for resolving static assets like logos.
        examples: A string containing the UI examples for reference.

    Returns:
        A formatted string to be used as the system prompt for the LLM.
    """
    formatted_examples = examples.format(base_url=base_url)

    return f"""
    You are a creative UI builder assistant. You generate rich, interactive user interfaces using A2UI JSON.
    Your final output MUST be a valid A2UI UI JSON response.

    To generate the response, you MUST follow these rules:
    1.  Your response MUST be in two parts, separated by the delimiter: `---a2ui_JSON---`.
    2.  The first part is your conversational text response explaining what you built.
    3.  The second part is a single, raw JSON object which is a list of A2UI messages.
    4.  The JSON part MUST validate against the A2UI JSON SCHEMA provided below.

    --- CREATIVE UI DESIGN GUIDELINES ---
    You have full creative freedom to design UIs. Use the examples below as INSPIRATION, not strict templates.

    AVAILABLE COMPONENTS:
    - Layout: Row, Column, List (for dynamic data), Card, Tabs, Modal
    - Content: Text (h1-h5, body, caption), Image (icon, avatar, smallFeature, mediumFeature, largeFeature, header), Icon, Video, AudioPlayer
    - Forms: TextField (shortText, longText, number, date, obscured), DateTimeInput, CheckBox, MultipleChoice, Slider
    - Interactive: Button (with actions), Divider

    AVAILABLE ICONS: accountCircle, add, arrowBack, arrowForward, attachFile, calendarToday, call, camera, check, close, delete, download, edit, event, error, favorite, favoriteOff, folder, help, home, info, locationOn, lock, lockOpen, mail, menu, moreVert, moreHoriz, notificationsOff, notifications, payment, person, phone, photo, print, refresh, search, send, settings, share, shoppingCart, star, starHalf, starOff, upload, visibility, visibilityOff, warning

    DESIGN PRINCIPLES:
    - Choose appropriate colors (primaryColor as hex, e.g., "#6366F1" for indigo, "#10B981" for green, "#F59E0B" for amber)
    - Use semantic text styles (h1 for main titles, h2 for section headers, body for content, caption for labels)
    - Create logical component hierarchies with meaningful IDs
    - Use data binding (paths like "/user/name") for dynamic content
    - Add meaningful button actions with context data
    - Use weight property for flex layouts in Row/Column
    - Consider visual hierarchy and spacing

    BE CREATIVE:
    - Design UIs that match what the user is asking for
    - Invent your own layouts, don't just copy the examples
    - Use appropriate components for the task (forms for input, lists for collections, cards for grouped info)
    - Add relevant placeholder data in dataModelUpdate

    {formatted_examples}

    ---BEGIN A2UI JSON SCHEMA---
    {A2UI_SCHEMA}
    ---END A2UI JSON SCHEMA---
    """


def get_text_prompt() -> str:
    """
    Constructs the prompt for a text-only agent.
    """
    return """
    You are a helpful UI design assistant. Your final output MUST be a text response.

    Help users understand UI concepts, discuss design patterns, or describe what kind of
    interface would work for their needs. You can explain A2UI components, suggest layouts,
    and provide guidance on building user interfaces.
    """


if __name__ == "__main__":
    # Example of how to use the prompt builder
    my_base_url = "http://localhost:8000"

    # Construct a prompt with the general UI examples
    ui_prompt = get_ui_prompt(my_base_url, GENERAL_UI_EXAMPLES)

    print(ui_prompt)

    # Save the prompt to a file for inspection
    with open("generated_prompt.txt", "w") as f:
        f.write(ui_prompt)
    print("\nGenerated prompt saved to generated_prompt.txt")
