package com.frontendeng

import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.label.ImageLabeling
import com.google.mlkit.vision.label.ImageLabeler
import com.google.mlkit.vision.label.defaults.ImageLabelerOptions
import java.io.File

class MLKitModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "MLKitModule"

    // Mapping các từ khóa phổ biến
    private val commonObjectsMap = mapOf(
        "fan" to "Fan",
        "electric fan" to "Fan",
        "ceiling fan" to "Fan",
        "chair" to "Chair",
        "seat" to "Chair",
        "furniture" to "Furniture",
        "table" to "Table",
        "desk" to "Table",
        "computer" to "Computer",
        "laptop" to "Laptop",
        "monitor" to "Monitor",
        "television" to "Television",
        "phone" to "Phone",
        "mobile phone" to "Phone",
        "mouse" to "Mouse",
        "keyboard" to "Keyboard",
        "book" to "Book",
        "pen" to "Pen",
        "pencil" to "Pencil",
        "bottle" to "Bottle",
        "cup" to "Cup",
        "glass" to "Glass",
        "door" to "Door",
        "window" to "Window",
        "clock" to "Clock",
        "watch" to "Watch"
    )

    @ReactMethod
    fun detectObjects(imagePath: String, promise: Promise) {
        try {
            val image = InputImage.fromFilePath(reactApplicationContext, Uri.fromFile(File(imagePath)))

            // Giảm ngưỡng confidence để bắt được nhiều đối tượng hơn
            val labeler = ImageLabeling.getClient(ImageLabelerOptions.Builder()
                .setConfidenceThreshold(0.5f)
                .build())

            labeler.process(image)
                .addOnSuccessListener { labels ->
                    try {
                        val resultArray = Arguments.createArray()
                        
                        // Log tất cả labels để debug
                        Log.d("MLKitModule", "All detected labels:")
                        labels.forEach { label ->
                            Log.d("MLKitModule", "Raw Label: ${label.text}, Confidence: ${label.confidence * 100}%")
                        }
                        
                        // Xử lý và map các labels
                        val processedLabels = labels.mapNotNull { label ->
                            val mappedText = commonObjectsMap[label.text.toLowerCase()] ?: label.text
                            if (mappedText.isNotEmpty()) {
                                Pair(mappedText, label.confidence)
                            } else null
                        }.distinctBy { it.first }
                        .sortedByDescending { it.second }
                        .take(3)
                        
                        if (processedLabels.isNotEmpty()) {
                            for ((text, confidence) in processedLabels) {
                                val labelMap = Arguments.createMap()
                                labelMap.putString("text", text)
                                labelMap.putDouble("confidence", confidence.toDouble())
                                resultArray.pushMap(labelMap)
                                
                                Log.d("MLKitModule", "Processed label: $text, Confidence: ${confidence * 100}%")
                            }
                        } else {
                            val noResultMap = Arguments.createMap()
                            noResultMap.putString("text", "Cannot identify object clearly")
                            noResultMap.putDouble("confidence", 0.0)
                            resultArray.pushMap(noResultMap)
                            
                            Log.d("MLKitModule", "No valid labels found")
                        }

                        promise.resolve(resultArray)
                    } catch (e: Exception) {
                        Log.e("MLKitModule", "Error processing results", e)
                        promise.reject("ERROR", "Error processing results: ${e.message}")
                    }
                }
                .addOnFailureListener { e ->
                    Log.e("MLKitModule", "Labeling failed", e)
                    promise.reject("ERROR", "Labeling failed: ${e.message}")
                }

        } catch (e: Exception) {
            Log.e("MLKitModule", "Error", e)
            promise.reject("ERROR", e.message)
        }
    }
}