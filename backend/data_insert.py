import csv
from pinecone_Manager import PineconeManager
from time import time

@staticmethod
def read_and_batch_hospital_csv(file_path):
    records = []

    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for idx, row in enumerate(reader, 1):
            hospital_data = (
                f"{row['Hospital Name']} located in {row['City']}, {row['District']}, {row['State']} "
                f"has a rating of {row['Rating']} based on {row['Number of Reviews']} reviews. "
                f"The area has a population density of {row['Density']} people per sq km. "
                f"Coordinates: ({row['Latitude']}, {row['Longitude']}). "
                f"Doctors Info: {row['info']}"
            )
            records.append({
                "_id": f"rec{idx}",
                "hospital_data": hospital_data
            })

    # Split into batches of 96
    batch_size = 96
    batched_records = [
        records[i:i + batch_size] for i in range(0, len(records), batch_size)
    ]
    return batched_records


pm = PineconeManager()
pm.create_index()

file_path = r'..\data\metadata2.csv'

hospital_records_list = read_and_batch_hospital_csv(file_path)


print(f"Number of batches to insert: {len(hospital_records_list)}")

count = 0

for hospital_records in hospital_records_list:
    print(f"Inserting batch {count + 1} with {len(hospital_records)} records...")

    count += 1
    pm.insert_data(hospital_records)

    if count % 10 == 0:
        print(f"Inserted {count} batches so far. Waiting for 5 seconds to avoid rate limits...")
        time.sleep(5)

print("All movie records have been inserted successfully.")
    


