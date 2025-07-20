
const cpp_functions_object = {
  "rle": "drawRLEFixed",
  "bitpacked": "drawBitPacked",
  "column_compress": "drawCompressedPixels",
  "sparse": "drawSparsePixels"
}

export function generate_oled_template(cpp_data_objects, frameDuration, isSingleFrame = false) {

  let frames = []
  let images_data_list = cpp_data_objects.map((frame, index) => {

    frames.push(`{imageData_${index},sizeof(imageData_${index}),${cpp_functions_object[frame.strategy]}}`)

    return frame.cpp
  })

  return `
    #include <Wire.h>
#include <avr/pgmspace.h>

unsigned long previousMillis = 0;
const unsigned long interval = ${frameDuration}; // milliseconds
int currentFrame = 0;

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_ADDRESS 0x3C // I2C address (usually 0x3C or 0x3D)

// Single display buffer - allocated once, reused for all operations
static uint8_t displayBuffer[SCREEN_WIDTH * SCREEN_HEIGHT / 8]; // 1024 bytes

// I2C buffer management (from Adafruit library)
#if defined(I2C_BUFFER_LENGTH)
#define WIRE_MAX min(256, I2C_BUFFER_LENGTH)
#elif defined(BUFFER_LENGTH)
#define WIRE_MAX min(256, BUFFER_LENGTH)
#elif defined(SERIAL_BUFFER_SIZE)
#define WIRE_MAX min(255, SERIAL_BUFFER_SIZE - 1)
#else
#define WIRE_MAX 32
#endif

${images_data_list.reduce((prev, curr) => prev + "\n \n" + curr)}


// SSD1306 commands
#define SSD1306_SETCONTRAST 0x81
#define SSD1306_DISPLAYALLON_RESUME 0xA4
#define SSD1306_DISPLAYALLON 0xA5
#define SSD1306_NORMALDISPLAY 0xA6
#define SSD1306_INVERTDISPLAY 0xA7
#define SSD1306_DISPLAYOFF 0xAE
#define SSD1306_DISPLAYON 0xAF
#define SSD1306_SETDISPLAYOFFSET 0xD3
#define SSD1306_SETCOMPINS 0xDA
#define SSD1306_SETVCOMDETECT 0xDB
#define SSD1306_SETDISPLAYCLOCKDIV 0xD5
#define SSD1306_SETPRECHARGE 0xD9
#define SSD1306_SETMULTIPLEX 0xA8
#define SSD1306_SETLOWCOLUMN 0x00
#define SSD1306_SETHIGHCOLUMN 0x10
#define SSD1306_SETSTARTLINE 0x40
#define SSD1306_MEMORYMODE 0x20
#define SSD1306_COMSCANINC 0xC0
#define SSD1306_COMSCANDEC 0xC8
#define SSD1306_SEGREMAP 0xA0
#define SSD1306_CHARGEPUMP 0x8D
#define SSD1306_EXTERNALVCC 0x1
#define SSD1306_SWITCHCAPVCC 0x2

typedef void (*RenderStrategy)(const uint8_t*, uint16_t);

struct Frame {
  const uint8_t* data;
  uint16_t length;
  RenderStrategy strategy;
};

// I2C communication functions (page-based, no buffer)
void ssd1306Command(uint8_t cmd) {
  Wire.beginTransmission(OLED_ADDRESS);
  Wire.write(0x00); // Command mode
  Wire.write(cmd);
  Wire.endTransmission();
}

void setPageWindow(uint8_t page) {
  ssd1306Command(0x22); // Page address
  ssd1306Command(page); // Start and end at same page
  ssd1306Command(page);
  ssd1306Command(0x21); // Column address
  ssd1306Command(0);    // Start column
  ssd1306Command(127);  // End column
}

void clearDisplayBuffer() {
  memset(displayBuffer, 0, sizeof(displayBuffer));
}

void displayBufferToOLED() {
  for (uint8_t page = 0; page < 8; page++) {
    setPageWindow(page);
    
    // Send data in chunks to respect I2C buffer limits
    for (uint8_t chunk = 0; chunk < SCREEN_WIDTH; chunk += WIRE_MAX - 1) {
      Wire.beginTransmission(OLED_ADDRESS);
      Wire.write(0x40); // Data mode
      
      uint8_t chunkSize = min(WIRE_MAX - 1, SCREEN_WIDTH - chunk);
      for (uint8_t i = 0; i < chunkSize; i++) {
        Wire.write(displayBuffer[page * SCREEN_WIDTH + chunk + i]);
      }
      Wire.endTransmission();
    }
  }
}

// Drawing functions - using single static buffer like Adafruit
void drawSparsePixels(const uint8_t* data, uint16_t length) {
  // Clear the buffer first
  clearDisplayBuffer();
  
  // Set pixels directly in the buffer
  for (uint16_t i = 0; i < length; i += 2) {
    uint8_t x = pgm_read_byte(&data[i]);
    uint8_t y = pgm_read_byte(&data[i + 1]);
    
    if (x < SCREEN_WIDTH && y < SCREEN_HEIGHT) {
      uint16_t byteIndex = (y / 8) * SCREEN_WIDTH + x;
      displayBuffer[byteIndex] |= (1 << (y & 7));
    }
  }
  
  // Send buffer to display
  displayBufferToOLED();
}

void drawCompressedPixels(const uint8_t* data, uint16_t length) {
  // Clear the buffer first
  clearDisplayBuffer();
  
  // Set pixels directly in the buffer
  uint16_t i = 0;
  while (i < length) {
    uint8_t x = pgm_read_byte(&data[i++]);
    uint8_t count = pgm_read_byte(&data[i++]);
    
    for (uint8_t j = 0; j < count; j++) {
      uint8_t y = pgm_read_byte(&data[i++]);
      
      if (x < SCREEN_WIDTH && y < SCREEN_HEIGHT) {
        uint16_t byteIndex = (y / 8) * SCREEN_WIDTH + x;
        displayBuffer[byteIndex] |= (1 << (y & 7));
      }
    }
  }
  
  // Send buffer to display
  displayBufferToOLED();
}

void drawRLEFixed(const uint8_t* data, uint16_t length) {
  // Clear the buffer first
  clearDisplayBuffer();
  
  // Process RLE data directly into buffer
  uint16_t index = 0;
  uint16_t pixelIndex = 0;
  
  while (index < length) {
    uint8_t bit = pgm_read_byte(&data[index++]);
    uint8_t runLength = pgm_read_byte(&data[index++]);
    
    for (uint8_t i = 0; i < runLength; i++) {
      if (bit && pixelIndex < (SCREEN_WIDTH * SCREEN_HEIGHT)) {
        uint16_t x = pixelIndex % SCREEN_WIDTH;
        uint16_t y = pixelIndex / SCREEN_WIDTH;
        uint16_t byteIndex = (y / 8) * SCREEN_WIDTH + x;
        displayBuffer[byteIndex] |= (1 << (y & 7));
      }
      pixelIndex++;
    }
  }
  
  // Send buffer to display
  displayBufferToOLED();
}

void drawBitPacked(const uint8_t* data, uint16_t length) {
  // Clear the buffer first
  clearDisplayBuffer();
  
  // Copy bit-packed data directly to buffer
  uint16_t copyLength = min(length, sizeof(displayBuffer));
  for (uint16_t i = 0; i < copyLength; i++) {
    displayBuffer[i] = pgm_read_byte(&data[i]);
  }
  
  // Send buffer to display
  displayBufferToOLED();
}

Frame frames[] = {
  ${frames}
};

void playAnimation() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    
    // Draw frame directly - buffer clearing is handled by each draw function
    frames[currentFrame].strategy(frames[currentFrame].data, frames[currentFrame].length);
    
    currentFrame++;
    if (currentFrame >= ${frames.length}) {
      currentFrame = 0;
    }
  }
}

void displaySingleFrame(int index) {
  frames[index].strategy(frames[index].data, frames[index].length);
}

void initDisplay() {
  // Initialize I2C
  Wire.begin();
  Wire.setClock(400000); // Fast I2C (400kHz)
  
  // Initialization sequence
  ssd1306Command(SSD1306_DISPLAYOFF);
  ssd1306Command(SSD1306_SETDISPLAYCLOCKDIV);
  ssd1306Command(0x80); // Suggested ratio
  ssd1306Command(SSD1306_SETMULTIPLEX);
  ssd1306Command(0x3F); // 64 rows
  ssd1306Command(SSD1306_SETDISPLAYOFFSET);
  ssd1306Command(0x00); // No offset
  ssd1306Command(SSD1306_SETSTARTLINE | 0x00);
  ssd1306Command(SSD1306_CHARGEPUMP);
  ssd1306Command(0x14); // Internal VCC
  ssd1306Command(SSD1306_MEMORYMODE);
  ssd1306Command(0x00); // Horizontal addressing
  ssd1306Command(SSD1306_SEGREMAP | 0x1);
  ssd1306Command(SSD1306_COMSCANDEC);
  ssd1306Command(SSD1306_SETCOMPINS);
  ssd1306Command(0x12); // COM pins
  ssd1306Command(SSD1306_SETCONTRAST);
  ssd1306Command(0xCF); // Contrast
  ssd1306Command(SSD1306_SETPRECHARGE);
  ssd1306Command(0xF1); // Precharge
  ssd1306Command(SSD1306_SETVCOMDETECT);
  ssd1306Command(0x40); // VCOM detect
  ssd1306Command(SSD1306_DISPLAYALLON_RESUME);
  ssd1306Command(SSD1306_NORMALDISPLAY);
  ssd1306Command(SSD1306_DISPLAYON);
  
  clearDisplayBuffer();
  displayBufferToOLED();
}

void setup() {
  initDisplay();
}

void loop() {
  playAnimation();
}

  `
  // ${frame_calls_strings.reduce((prev, curr) => prev + "\n \n" + curr)}
}

export function generate_oled_template_SPI(cpp_data_objects, frameDuration, cs = "none", reset = 11, dc = 12, isSingleFrame = false) {

  let frames = []
  let images_data_list = cpp_data_objects.map((frame, index) => {

    frames.push(`{imageData_${index},sizeof(imageData_${index}),${cpp_functions_object[frame.strategy]}}`)

    return frame.cpp
  })
  return `
  #include <SPI.h>
#include <avr/pgmspace.h>

unsigned long previousMillis = 0;
const unsigned long interval = ${frameDuration}; // milliseconds
int currentFrame = 0;

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define OLED_DC     ${dc}   // Data/Command

#define OLED_RESET  ${reset} //Reset

${cs === "none" ? "" : `#define OLED_CS ${cs}// Not connected (optional)`}

uint8_t displayBuffer[SCREEN_WIDTH * SCREEN_HEIGHT / 8] = {0};


${images_data_list.reduce((prev, curr) => prev + "\n \n" + curr)}

// SSD1306 commands
#define SSD1306_SETCONTRAST 0x81
#define SSD1306_DISPLAYALLON_RESUME 0xA4
#define SSD1306_DISPLAYALLON 0xA5
#define SSD1306_NORMALDISPLAY 0xA6
#define SSD1306_INVERTDISPLAY 0xA7
#define SSD1306_DISPLAYOFF 0xAE
#define SSD1306_DISPLAYON 0xAF
#define SSD1306_SETDISPLAYOFFSET 0xD3
#define SSD1306_SETCOMPINS 0xDA
#define SSD1306_SETVCOMDETECT 0xDB
#define SSD1306_SETDISPLAYCLOCKDIV 0xD5
#define SSD1306_SETPRECHARGE 0xD9
#define SSD1306_SETMULTIPLEX 0xA8
#define SSD1306_SETLOWCOLUMN 0x00
#define SSD1306_SETHIGHCOLUMN 0x10
#define SSD1306_SETSTARTLINE 0x40
#define SSD1306_MEMORYMODE 0x20
#define SSD1306_COMSCANINC 0xC0
#define SSD1306_COMSCANDEC 0xC8
#define SSD1306_SEGREMAP 0xA0
#define SSD1306_CHARGEPUMP 0x8D
#define SSD1306_EXTERNALVCC 0x1
#define SSD1306_SWITCHCAPVCC 0x2

// Image data (placeholder - same as your original)


typedef void (*RenderStrategy)(const uint8_t*, uint16_t);

struct Frame {
  const uint8_t* data;
  uint16_t length;
  RenderStrategy strategy;
};

// Low-level display functions
void ssd1306Command(uint8_t cmd) {
  digitalWrite(OLED_DC, LOW);
  SPI.transfer(cmd);
}

void ssd1306Data(uint8_t data) {
  digitalWrite(OLED_DC, HIGH);
  SPI.transfer(data);
}

void setAddrWindow(uint8_t x0, uint8_t y0, uint8_t x1, uint8_t y1) {
  ssd1306Command(0x21); // Column address
  ssd1306Command(x0);   // Start column
  ssd1306Command(x1);   // End column
  
  ssd1306Command(0x22); // Page address
  ssd1306Command(y0);   // Start page
  ssd1306Command(y1);   // End page
}

void clearDisplay() {
  memset(displayBuffer, 0, sizeof(displayBuffer));
  setAddrWindow(0, 0, SCREEN_WIDTH-1, 7);
  for (uint16_t i=0; i<sizeof(displayBuffer); i++) {
    ssd1306Data(0x00);
  }
}
void drawPixel(uint8_t x, uint8_t y) {
  if (x >= SCREEN_WIDTH || y >= SCREEN_HEIGHT) return;
  
  uint16_t index = x + (y / 8) * SCREEN_WIDTH;
  uint8_t bit_mask = 1 << (y % 8);
  
  displayBuffer[index] |= bit_mask;  // OR operation to preserve other pixels
}

void display() {
  setAddrWindow(0, 0, SCREEN_WIDTH-1, 7); // Set addressing to entire display
  
  for (uint16_t i=0; i<sizeof(displayBuffer); i++) {
    ssd1306Data(displayBuffer[i]);
  }
}
// Drawing functions (same as original but using our drawPixel)
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
        drawPixel(x, y);
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
      drawPixel(x, y);
    }
  }
}

void drawSparsePixels(const uint8_t* data, uint16_t length) {
  for (uint16_t i = 0; i < length; i += 2) {
    uint8_t x = pgm_read_byte(&data[i]);
    uint8_t y = pgm_read_byte(&data[i + 1]);
    drawPixel(x, y);
  }
}

void drawBitPacked(const uint8_t* data, uint16_t length) {
  for (uint8_t page = 0; page < 8; page++) {
    for (uint8_t x = 0; x < 128; x++) {
      uint8_t byte = pgm_read_byte(&data[page * 128 + x]);
      for (uint8_t bit = 0; bit < 8; bit++) {
        if (byte & (1 << bit)) {
          drawPixel(x, page * 8 + bit);
        }
      }
    }
  }
}

Frame frames[] = {
${frames}
};

void playAnimation() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    
    clearDisplay();
    frames[currentFrame].strategy(frames[currentFrame].data, frames[currentFrame].length);
    display();  // Push buffer to hardware
    
    currentFrame++;
    if (currentFrame >= ${frames.length}) {
      currentFrame = 0;
    }
  }
}
void displaySingleFrame(int index) {
  frames[index].strategy(frames[index].data, frames[index].length);
}


void initDisplay() {
  // Initialize reset pin
  pinMode(OLED_RESET, OUTPUT);
  digitalWrite(OLED_RESET, HIGH);
  delay(1);
  digitalWrite(OLED_RESET, LOW);
  delay(10);
  digitalWrite(OLED_RESET, HIGH);
  
  // Initialize DC pin
  pinMode(OLED_DC, OUTPUT);
  
  // Initialize SPI
  SPI.begin();
  
  // Initialization sequence
  ssd1306Command(SSD1306_DISPLAYOFF);
  ssd1306Command(SSD1306_SETDISPLAYCLOCKDIV);
  ssd1306Command(0x80); // Suggested ratio
  ssd1306Command(SSD1306_SETMULTIPLEX);
  ssd1306Command(0x3F); // 64 rows
  ssd1306Command(SSD1306_SETDISPLAYOFFSET);
  ssd1306Command(0x00); // No offset
  ssd1306Command(SSD1306_SETSTARTLINE | 0x00);
  ssd1306Command(SSD1306_CHARGEPUMP);
  ssd1306Command(0x14); // Internal VCC
  ssd1306Command(SSD1306_MEMORYMODE);
  ssd1306Command(0x00); // Horizontal addressing
  ssd1306Command(SSD1306_SEGREMAP | 0x1);
  ssd1306Command(SSD1306_COMSCANDEC);
  ssd1306Command(SSD1306_SETCOMPINS);
  ssd1306Command(0x12); // COM pins
  ssd1306Command(SSD1306_SETCONTRAST);
  ssd1306Command(0xCF); // Contrast
  ssd1306Command(SSD1306_SETPRECHARGE);
  ssd1306Command(0xF1); // Precharge
  ssd1306Command(SSD1306_SETVCOMDETECT);
  ssd1306Command(0x40); // VCOM detect
  ssd1306Command(SSD1306_DISPLAYALLON_RESUME);
  ssd1306Command(SSD1306_NORMALDISPLAY);
  ssd1306Command(SSD1306_DISPLAYON);
  
  clearDisplay();
}

void setup() {
  initDisplay();
}

void loop() {
  playAnimation();
}
  `

}


export default { generate_oled_template, generate_oled_template_SPI }