import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, Media } from 'docx';
import { saveAs } from 'file-saver';
import { DraftItem, PatientInfo } from './types';

// Helper function to fetch image as ArrayBuffer
async function fetchImageAsArrayBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    const blob = await response.blob();
    return await blob.arrayBuffer();
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

// Generate Word document for prescription
export async function generatePrescriptionWord(
  draftItems: DraftItem[],
  patientInfo: PatientInfo
): Promise<void> {
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create document first (needed for Media.addImage)
  const doc = new Document();

  // Prepare images first
  const imageMedia: { [key: number]: any } = {};
  for (let i = 0; i < draftItems.length; i++) {
    const item = draftItems[i];
    if (item.imageUrl) {
      try {
        const imageBuffer = await fetchImageAsArrayBuffer(item.imageUrl);
        if (imageBuffer) {
          // Convert ArrayBuffer to Uint8Array
          const imageData = new Uint8Array(imageBuffer);
          imageMedia[i] = Media.addImage(doc, imageData, 100, 100);
        }
      } catch (error) {
        console.error('Error loading image:', error);
      }
    }
  }

  // Create header
  const header = new Paragraph({
    children: [
      new TextRun({
        text: "ĐƠN THUỐC",
        bold: true,
        size: 32,
        font: "Times New Roman"
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 }
  });

  // Clinic/Doctor info
  const clinicInfo = new Paragraph({
    children: [
      new TextRun({
        text: patientInfo.clinicName || "PHÒNG KHÁM MEDINOVA",
        bold: true,
        size: 24
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 }
  });

  const doctorInfo = new Paragraph({
    children: [
      new TextRun({
        text: `Bác sĩ: ${patientInfo.doctorName || "BS. Nguyễn Văn A"}`,
        size: 22
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 }
  });

  // Patient information section
  const patientSectionTitle = new Paragraph({
    children: [
      new TextRun({
        text: "THÔNG TIN BỆNH NHÂN",
        bold: true,
        size: 24
      })
    ],
    spacing: { before: 200, after: 100 }
  });

  const patientDetails = [
    new Paragraph({
      children: [
        new TextRun({
          text: `Họ và tên: ${patientInfo.name}`,
          size: 22
        })
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Tuổi: ${patientInfo.age}`,
          size: 22
        })
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Địa chỉ: ${patientInfo.address}`,
          size: 22
        })
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Chẩn đoán: ${patientInfo.diagnosis}`,
          size: 22,
          bold: true
        })
      ],
      spacing: { after: 200 }
    })
  ];

  // Prescription items section
  const prescriptionTitle = new Paragraph({
    children: [
      new TextRun({
        text: "ĐƠN THUỐC",
        bold: true,
        size: 24
      })
    ],
    spacing: { before: 200, after: 200 }
  });

  // Create table for prescription items
  const tableRows: TableRow[] = [];

  // Table header
  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: "STT", bold: true, size: 20 })],
          alignment: AlignmentType.CENTER
        })],
        width: { size: 5, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: "Ảnh", bold: true, size: 20 })],
          alignment: AlignmentType.CENTER
        })],
        width: { size: 15, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: "Tên thuốc", bold: true, size: 20 })],
          alignment: AlignmentType.CENTER
        })],
        width: { size: 25, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: "Liều dùng", bold: true, size: 20 })],
          alignment: AlignmentType.CENTER
        })],
        width: { size: 15, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: "Số lần/ngày", bold: true, size: 20 })],
          alignment: AlignmentType.CENTER
        })],
        width: { size: 10, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: "Số ngày", bold: true, size: 20 })],
          alignment: AlignmentType.CENTER
        })],
        width: { size: 10, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: "Số lượng", bold: true, size: 20 })],
          alignment: AlignmentType.CENTER
        })],
        width: { size: 10, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: "Ghi chú", bold: true, size: 20 })],
          alignment: AlignmentType.CENTER
        })],
        width: { size: 10, type: WidthType.PERCENTAGE }
      })
    ]
  });
  tableRows.push(headerRow);

  // Add prescription items
  for (let i = 0; i < draftItems.length; i++) {
    const item = draftItems[i];
    let imageParagraph: Paragraph;

    if (imageMedia[i]) {
      imageParagraph = new Paragraph({
        children: [imageMedia[i]],
        alignment: AlignmentType.CENTER
      });
    } else {
      imageParagraph = new Paragraph({
        children: [new TextRun({ text: "N/A", size: 18 })],
        alignment: AlignmentType.CENTER
      });
    }

    const row = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: `${i + 1}`, size: 20 })],
            alignment: AlignmentType.CENTER
          })],
          width: { size: 5, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [imageParagraph],
          width: { size: 15, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: item.brandName, bold: true, size: 20 }),
                new TextRun({ text: `\n${item.activeIngredient}`, size: 18 }),
                new TextRun({ text: `\n${item.strength} - ${item.dosageForm}`, size: 18 })
              ]
            })
          ],
          width: { size: 25, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: item.dose || "N/A", size: 20 })],
            alignment: AlignmentType.CENTER
          })],
          width: { size: 15, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: `${item.frequencyPerDay}`, size: 20 })],
            alignment: AlignmentType.CENTER
          })],
          width: { size: 10, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: `${item.days}`, size: 20 })],
            alignment: AlignmentType.CENTER
          })],
          width: { size: 10, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: `${item.quantity}`, size: 20 })],
            alignment: AlignmentType.CENTER
          })],
          width: { size: 10, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: item.note || "-", size: 18 })],
            alignment: AlignmentType.CENTER
          })],
          width: { size: 10, type: WidthType.PERCENTAGE }
        })
      ]
    });
    tableRows.push(row);
  }

  const prescriptionTable = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE }
  });

  // Footer with date and signature
  const dateParagraph = new Paragraph({
    children: [
      new TextRun({
        text: `Ngày ${currentDate}`,
        size: 22
      })
    ],
    alignment: AlignmentType.RIGHT,
    spacing: { before: 400, after: 200 }
  });

  const signatureParagraph = new Paragraph({
    children: [
      new TextRun({
        text: patientInfo.doctorName || "BS. Nguyễn Văn A",
        bold: true,
        size: 24
      })
    ],
    alignment: AlignmentType.RIGHT,
    spacing: { before: 300 }
  });

  // Add sections to document
  doc.addSection({
    children: [
      header,
      clinicInfo,
      doctorInfo,
      patientSectionTitle,
      ...patientDetails,
      prescriptionTitle,
      prescriptionTable,
      dateParagraph,
      signatureParagraph
    ]
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const fileName = `DonThuoc_${patientInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, fileName);
}
