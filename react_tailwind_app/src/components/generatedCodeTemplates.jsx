
const cpp_functions_object = {
    "rle": "drawRLEFixed",
    "bitpacked": "drawBitPacked",
    "column_compress": "drawCompressedPixels",
    "sparse": "drawSparsePixels"
}

export function generate_oled_template(cpp_data_objects,frameDuration) {
    let frames = []

    let images_data_list = cpp_data_objects.map((frame, index) => {

        frames.push(`{imageData_${index},sizeof(imageData_${index}),${cpp_functions_object[frame.strategy]}}`)

        return frame.cpp
    })
    console.log("reduced")
   // let frame_calls_strings = frames.map((e, i) => `frames[${i}].strategy(frames[${i}].data,frames[${i}].length)`)

    // console.log(frames)
    return `
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <avr/pgmspace.h>

unsigned long previousMillis = 0;
const unsigned long interval = ${frameDuration}; // milliseconds
int currentFrame = 0;


#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET     -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

 

${images_data_list.reduce((prev, curr) => prev + "\n \n" + curr)}

typedef void (*RenderStrategy)(const uint8_t*, uint16_t);

struct Frame {
   const uint8_t* data;
  uint16_t length;
  RenderStrategy strategy;
};



void drawRLEFixed(const uint8_t* data, uint16_t length) {
  uint16_t index = 0;
  uint16_t pixelIndex = 0;

  while (index < length) {
    uint8_t bit = pgm_read_byte(&data[index++]);
    uint8_t runLength = pgm_read_byte(&data[index++]);

    for (uint8_t i = 0; i < runLength; i++) {
      if (bit) {
        uint16_t x = pixelIndex % 128;
        uint16_t y = pixelIndex / 128;
        display.drawPixel(x, y, SSD1306_WHITE);
      }
      pixelIndex++;
    }
  }
}



void drawCompressedPixels(const uint8_t* data, uint16_t length) {
  uint16_t i = 0;
  while (i < length) {
    uint8_t x = pgm_read_byte(&data[i++]);
    uint8_t count = pgm_read_byte(&data[i++]);

    for (uint8_t j = 0; j < count; j++) {
      uint8_t y = pgm_read_byte(&data[i++]);
      display.drawPixel(x, y, SSD1306_WHITE);
    }
  }
}


void drawSparsePixels(const uint8_t* data, uint16_t length) {
  for (uint16_t i = 0; i < length; i += 2) {
    uint8_t x = pgm_read_byte(&data[i]);
    uint8_t y = pgm_read_byte(&data[i + 1]);
    display.drawPixel(x, y, SSD1306_WHITE);
  }
}

void drawBitPacked(const uint8_t* data, uint16_t length) {
  for (uint8_t page = 0; page < 8; page++) {
    for (uint8_t x = 0; x < 128; x++) {
      uint8_t byte = pgm_read_byte(&data[page * 128 + x]);
      for (uint8_t bit = 0; bit < 8; bit++) {
        if (byte & (1 << bit)) {
          display.drawPixel(x, page * 8 + bit, SSD1306_WHITE);
        }
      }
    }
  }
}

Frame frames[] = {
${frames}
};
void setup() {
display.begin(SSD1306_SWITCHCAPVCC, 0x3C);

}

void loop() {
 unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    display.clearDisplay();
    frames[currentFrame].strategy(frames[currentFrame].data, frames[currentFrame].length);
    display.display();

    currentFrame++;
    if (currentFrame >= ${frames.length}) {
      currentFrame = 0; // loop back to first frame
    }
  }

}


`
    // ${frame_calls_strings.reduce((prev, curr) => prev + "\n \n" + curr)}
}


export function generate_oled_code_RLE(cpp_data_string, index) {


    return `#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <avr/pgmspace.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET     -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

${cpp_data_string}

void drawRLEFixed() {
  uint16_t index = 0;
  uint16_t pixelIndex = 0;

  while (index < imageDataLength) {
    uint8_t bit = pgm_read_byte(&imageData[index++]);
    uint8_t runLength = pgm_read_byte(&imageData[index++]);

    for (uint8_t i = 0; i < runLength; i++) {
      if (bit) {
        uint16_t x = pixelIndex % 128;
        uint16_t y = pixelIndex / 128;
        display.drawPixel(x, y, SSD1306_WHITE);
      }
      pixelIndex++;
    }
  }
}

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  drawRLEFixed();
   frames[0].strategy(frames[0].data,frames[0].length)
  display.display();
}

void loop() {}`

}


export function generate_oled_code_bitpacked(cpp_data_string, index) {


    return `#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <avr/pgmspace.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET     -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Each byte encodes 8 vertical pixels at column x
${cpp_data_string}
void drawBitPacked() {
  for (uint8_t page = 0; page < 8; page++) {
    for (uint8_t x = 0; x < 128; x++) {
      uint8_t byte = pgm_read_byte(&imageData[page * 128 + x]);
      for (uint8_t bit = 0; bit < 8; bit++) {
        if (byte & (1 << bit)) {
          display.drawPixel(x, page * 8 + bit, SSD1306_WHITE);
        }
      }
    }
  }
}

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
 frames[0].strategy(frames[0].data,frames[0].length);
  display.display();
    delay(300);
  display.clearDisplay();
 frames[1].strategy(frames[1].data,frames[1].length);
  display.display();
    delay(300);
  display.clearDisplay();
 frames[2].strategy(frames[2].data,frames[2].length);
  display.display();
}

void loop() {}`

}

export function generate_oled_code_sparse(cpp_data_string, index) {


    return `#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <avr/pgmspace.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET     -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

${cpp_data_string}
void drawSparsePixels() {
  for (uint16_t i = 0; i < imageDataLength; i += 2) {
    uint8_t x = pgm_read_byte(&imageData[i]);
    uint8_t y = pgm_read_byte(&imageData[i + 1]);
    display.drawPixel(x, y, SSD1306_WHITE);
  }
}

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  drawSparsePixels();
  display.display();
}

void loop() {}
`

}



export function generate_oled_code_compress_column(cpp_data_string, index) {


    return `
    #include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
${cpp_data_string}
void drawCompressedPixels() {
    uint16_t i = 0;
    while (i < pixelCount ) {
        uint8_t x = pgm_read_byte(&pixelData[i++]);  // Read x
        uint8_t count = pgm_read_byte(&pixelData[i++]); // Read count

        for (uint8_t j = 0; j < count; j++) {
            uint8_t y = pgm_read_byte(&pixelData[i++]);  // Read each y
            display.drawPixel(x, y, SSD1306_WHITE);
        }
    }
}



void setup() {
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();
   frames[0].strategy(frames[0].data,frames[0].length);
    display.display();
}

void loop() {}
`

}

// const code_generation_templates = {
//     "rle": generate_oled_code_RLE,
//     "bitpacked": generate_oled_code_bitpacked,
//     "column_compress": generate_oled_code_compress_column,
//     "sparse": generate_oled_code_sparse
// }



export default generate_oled_template



